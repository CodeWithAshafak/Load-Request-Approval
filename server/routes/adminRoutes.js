import express from "express";
import SKU from "../models/SKU.js";
import Vehicle from "../models/Vehicle.js";
import { RecommendedOrder, PreOrder, POSMOrder, PSROrder } from "../models/Orders.js";

const router = express.Router();

// Add SKU
router.post("/sku", async (req, res) => {
  try {
    const sku = new SKU(req.body);
    await sku.save();
    res.json({ message: "SKU added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Vehicle
router.post("/vehicle", async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.json({ message: "Vehicle added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Order
router.post("/order", async (req, res) => {
  try {
    const { type, ...orderData } = req.body;
    let Model;
    if (type === "Recommended") Model = RecommendedOrder;
    if (type === "PreOrder") Model = PreOrder;
    if (type === "POSM") Model = POSMOrder;
    if (type === "PSR") Model = PSROrder;

    if (!Model) return res.status(400).json({ message: "Invalid order type" });

    const order = new Model(orderData);
    await order.save();
    res.json({ message: `${type} order added` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
