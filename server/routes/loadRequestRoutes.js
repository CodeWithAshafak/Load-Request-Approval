import express from "express";
import jwt from "jsonwebtoken";
import LoadRequest from "../models/LoadRequest.js";
import TruckAssignment from "../models/TruckAssignment.js";
import LoadingLog from "../models/LoadingLog.js";
import Notification from "../models/Notification.js";
import WarehouseStock from "../models/WarehouseStock.js";
import Vehicle from "../models/Vehicle.js";
import SKU from "../models/SKU.js";
import User from "../models/User.js";
import { RecommendedOrder, PreOrder, POSMOrder, PSROrder } from "../models/OrderCollections.js";

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET Recommended Load for LSR
router.get("/recommended/:lsrId", authenticateToken, async (req, res) => {
  try {
    const { lsrId } = req.params;

    // Assign default truck (first available for depot 1)
    const defaultTruck = await Vehicle.findOne({ status: "Available", depotId: "1" });
    if (!defaultTruck) return res.status(404).json({ message: "No available truck found" });

    // Fetch SKUs & Orders from different collections
    const skuMap = {};
    (await SKU.find()).forEach(s => skuMap[s.skuId] = s);

    const recOrders = await RecommendedOrder.find({ lsrId });
    const preOrders = await PreOrder.find({ lsrId });
    const posmOrders = await POSMOrder.find({ lsrId });
    const psrOrders = await PSROrder.find({ lsrId });

    // Merge all order types into one list
    const combined = [
      ...recOrders.map(o => ({
        skuId: o.skuId,
        skuName: skuMap[o.skuId]?.productName || "",
        brand: skuMap[o.skuId]?.brand || "",
        outletId: o.outletId,
        orderType: "Recommended",
        requestedQty: o.qty
      })),
      ...preOrders.map(o => ({
        skuId: o.skuId,
        skuName: skuMap[o.skuId]?.productName || "",
        brand: skuMap[o.skuId]?.brand || "",
        outletId: o.outletId,
        orderType: "PreOrder",
        requestedQty: o.qty
      })),
      ...posmOrders.map(o => ({
        skuId: o.skuId,
        skuName: skuMap[o.skuId]?.productName || "",
        brand: skuMap[o.skuId]?.brand || "",
        outletId: o.outletId,
        orderType: "POSM",
        requestedQty: o.qty
      })),
      ...psrOrders.map(o => ({
        skuId: o.skuId,
        skuName: skuMap[o.skuId]?.productName || "",
        brand: skuMap[o.skuId]?.brand || "",
        outletId: o.outletId,
        orderType: "PSR",
        requestedQty: o.qty
      }))
    ];

    res.json({
      truckId: defaultTruck.truckId,
      truckNumber: defaultTruck.truckNo,
      capacity: defaultTruck.capacity,
      load: combined,
      bufferAdjustment: 0
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Submit Load Request
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { lsrId, selectedTruckId, bufferAdjustment, lineItems } = req.body;
    
    console.log("Received load request submission:", { lsrId, selectedTruckId, bufferAdjustment, lineItemsCount: lineItems?.length });

    // Generate unique request ID
    const requestId = 'LR' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Validate lineItems structure
    const validatedLineItems = lineItems.map(item => ({
      skuId: item.skuId || '',
      skuName: item.skuName || '',
      brand: item.brand || '',
      outletId: item.outletId || '',
      orderType: item.orderType || 'Recommended',
      requestedQty: Number(item.requestedQty) || 0,
      approvedQty: 0,
      shippedQty: 0
    }));
    
    const loadRequest = new LoadRequest({
      requestId,
      lsrId,
      defaultTruckId: selectedTruckId,
      selectedTruckId,
      journeyDate: new Date(),
      bufferAdjustment: Number(bufferAdjustment) || 0,
      status: "Submitted",
      lineItems: validatedLineItems,
      submittedAt: new Date(),
      depotId: "1" // Default depot
    });

    await loadRequest.save();
    console.log("Load request saved with ID:", loadRequest.requestId);

    // Create notification for officer - find the officer user
    const officerUser = await User.findOne({ role: "officer" });
    if (officerUser) {
      // Generate notification ID
      const notificationId = 'NT' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      const notification = new Notification({
        notificationId,
        userId: officerUser._id.toString(),
        message: `New load request submitted by LSR ${lsrId} (Request ID: ${loadRequest.requestId})`,
        status: "Unread",
        type: "Approval",
        relatedRequestId: loadRequest.requestId
      });
      await notification.save();
      console.log("Notification created for officer:", officerUser._id);
    } else {
      console.log("No officer user found");
    }

    res.json({ message: "Load request submitted successfully", requestId: loadRequest.requestId });
  } catch (err) {
    console.error("Error submitting load request:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET Load Requests for Officer Approval
router.get("/approval/:depotId", authenticateToken, async (req, res) => {
  try {
    const { depotId } = req.params;
    
    console.log("Fetching load requests for depot:", depotId);
    
    const loadRequests = await LoadRequest.find({ 
      depotId, 
      status: "Submitted" 
    }).populate('lineItems');

    console.log("Found load requests:", loadRequests.length);

    // Get consolidated view with drill-down capability
    const consolidatedView = [];
    
    for (const request of loadRequests) {
      for (const item of request.lineItems) {
        const truck = await Vehicle.findOne({ truckId: request.selectedTruckId });
        
        consolidatedView.push({
          depotId: request.depotId,
          lsrId: request.lsrId,
          customerId: item.outletId,
          skuId: item.skuId,
          brand: item.brand,
          productName: item.skuName,
          requestedQty: item.requestedQty,
          approvedQty: item.approvedQty,
          truckId: request.selectedTruckId,
          capacityUtilization: truck ? (request.lineItems.reduce((sum, li) => sum + li.requestedQty, 0) / truck.capacity * 100).toFixed(1) + '%' : '0%',
          requestId: request.requestId
        });
      }
    }

    console.log("Returning consolidated view with", consolidatedView.length, "items");
    res.json(consolidatedView);
  } catch (err) {
    console.error("Error fetching load requests:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT Approve Load Request
router.put("/:requestId/approve", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approvedItems, truckAssignment, approvedBy } = req.body;

    const loadRequest = await LoadRequest.findOne({ requestId });
    if (!loadRequest) {
      return res.status(404).json({ message: "Load request not found" });
    }

    // Update line items with approved quantities
    for (const approvedItem of approvedItems) {
      const lineItem = loadRequest.lineItems.find(item => item.skuId === approvedItem.skuId);
      if (lineItem) {
        lineItem.approvedQty = approvedItem.approvedQty;
        
        // Create notification if approved quantity is less than requested
        if (approvedItem.approvedQty < lineItem.requestedQty) {
          const notification = new Notification({
            userId: loadRequest.lsrId,
            message: `Approved Qty (${approvedItem.approvedQty}) less than Requested (${lineItem.requestedQty}) for SKU ${approvedItem.skuId}`,
            type: "Approval",
            relatedRequestId: requestId
          });
          await notification.save();
        }
      }
    }

    // Update truck assignment
    loadRequest.truckAssignment = truckAssignment;
    loadRequest.status = "Approved";
    loadRequest.approvedAt = new Date();
    loadRequest.approvedBy = approvedBy;

    await loadRequest.save();

    // Create truck assignment record
    const truckAssignmentRecord = new TruckAssignment({
      requestId: loadRequest.requestId,
      truckId: truckAssignment.truckId,
      driverId: truckAssignment.driverId,
      helperId: truckAssignment.helperId,
      capacity: truckAssignment.capacity,
      utilizationPct: truckAssignment.capacityUtilization
    });
    await truckAssignmentRecord.save();

    res.json(loadRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Load Assignments for Forklift
router.get("/assignments", authenticateToken, async (req, res) => {
  try {
    const assignments = await TruckAssignment.find({ 
      status: { $in: ["Assigned", "Loading"] } 
    }).populate('requestId');

    const loadAssignments = [];
    
    for (const assignment of assignments) {
      const loadRequest = await LoadRequest.findOne({ requestId: assignment.requestId });
      if (loadRequest) {
        loadAssignments.push({
          ...assignment.toObject(),
          loadRequest: loadRequest
        });
      }
    }

    res.json(loadAssignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Log Shipment
router.post("/assignments/:assignmentId/ship", authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { shipmentData } = req.body;

    const assignment = await TruckAssignment.findOne({ assignmentId });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Create loading log entries
    for (const item of shipmentData.items) {
      const loadingLog = new LoadingLog({
        assignmentId: assignment.assignmentId,
        skuId: item.skuId,
        loadedQty: item.shippedQty,
        loadingStart: shipmentData.loadingStart,
        loadingEnd: shipmentData.loadingEnd,
        departureTime: shipmentData.departureTime,
        remarks: item.remarks,
        discrepancyReason: item.discrepancyReason,
        discrepancyDetails: item.discrepancyDetails
      });
      await loadingLog.save();

      // Update warehouse stock
      const warehouseStock = await WarehouseStock.findOne({ 
        skuId: item.skuId, 
        warehouseId: "1" 
      });
      
      if (warehouseStock) {
        warehouseStock.availableQty -= item.shippedQty;
        warehouseStock.updatedOn = new Date();
        await warehouseStock.save();
      }

      // Update load request line item
      const loadRequest = await LoadRequest.findOne({ requestId: assignment.requestId });
      if (loadRequest) {
        const lineItem = loadRequest.lineItems.find(li => li.skuId === item.skuId);
        if (lineItem) {
          lineItem.shippedQty = item.shippedQty;
          
          // Create notification for discrepancies
          if (item.shippedQty < lineItem.approvedQty && item.discrepancyReason) {
            const notification = new Notification({
              userId: loadRequest.lsrId,
              message: `Shipped Qty (${item.shippedQty}) less than Approved (${lineItem.approvedQty}) for SKU ${item.skuId}. Reason: ${item.discrepancyReason}`,
              type: "Discrepancy",
              relatedRequestId: loadRequest.requestId
            });
            await notification.save();
          }
        }
        loadRequest.status = "Shipped";
        await loadRequest.save();
      }
    }

    // Update assignment status
    assignment.status = "Shipped";
    assignment.loadingStartTime = shipmentData.loadingStart;
    assignment.loadingEndTime = shipmentData.loadingEnd;
    assignment.departureTime = shipmentData.departureTime;
    await assignment.save();

    res.json({ message: "Shipment logged successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Reconciliation Report
router.get("/reconciliation/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const loadRequest = await LoadRequest.findOne({ requestId });
    if (!loadRequest) {
      return res.status(404).json({ message: "Load request not found" });
    }

    const loadingLogs = await LoadingLog.find({ 
      assignmentId: { $in: await TruckAssignment.find({ requestId }).distinct('assignmentId') }
    });

    const reconciliation = {
      requestId: loadRequest.requestId,
      lsrId: loadRequest.lsrId,
      journeyDate: loadRequest.journeyDate,
      items: loadRequest.lineItems.map(item => {
        const log = loadingLogs.find(l => l.skuId === item.skuId);
        return {
          skuId: item.skuId,
          skuName: item.skuName,
          brand: item.brand,
          requestedQty: item.requestedQty,
          approvedQty: item.approvedQty,
          shippedQty: item.shippedQty,
          discrepancy: item.approvedQty - item.shippedQty,
          discrepancyReason: log?.discrepancyReason || null
        };
      }),
      summary: {
        totalRequested: loadRequest.lineItems.reduce((sum, item) => sum + item.requestedQty, 0),
        totalApproved: loadRequest.lineItems.reduce((sum, item) => sum + item.approvedQty, 0),
        totalShipped: loadRequest.lineItems.reduce((sum, item) => sum + item.shippedQty, 0)
      }
    };

    res.json(reconciliation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
