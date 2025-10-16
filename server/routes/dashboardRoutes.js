

import express from "express";
import SKU from "../models/SKU.js";
import Vehicle from "../models/Vehicle.js";
import { RecommendedOrder, PreOrder, POSMOrder, PSROrder } from "../models/Orders.js";

const router = express.Router();

// 📌 Get SKUs
router.get("/sku", async (req, res) => {
  try {
    const skus = await SKU.find();
    res.json(skus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Get Vehicles
router.get("/vehicle", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Get Orders (all types)
router.get("/orders", async (req, res) => {
  try {
    const recommended = await RecommendedOrder.find();
    const preOrders = await PreOrder.find();
    const posmOrders = await POSMOrder.find();
    const psrOrders = await PSROrder.find();

    res.json({ recommended, preOrders, posmOrders, psrOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
