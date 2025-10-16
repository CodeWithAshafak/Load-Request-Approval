import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Product from "./models/Product.js";
import Posm from "./models/Posm.js";
import User from "./models/User.js";
import { connectDB } from "./config/db.js";

// Products data
const products = [
  {"sku": "COLA-330", "name": "Cola 330ml", "defaultUom": "CASE"},
  {"sku": "COLA-500", "name": "Cola 500ml", "defaultUom": "CASE"},
  {"sku": "COLA-1L", "name": "Cola 1L", "defaultUom": "CASE"},
  {"sku": "WATER-500", "name": "Still Water 500ml", "defaultUom": "CASE"},
  {"sku": "WATER-1L", "name": "Still Water 1L", "defaultUom": "CASE"},
  {"sku": "WATER-SPARK-330", "name": "Sparkling Water 330ml", "defaultUom": "CASE"},
  {"sku": "JUICE-ORA-200", "name": "Orange Juice 200ml", "defaultUom": "CASE"},
  {"sku": "JUICE-APP-200", "name": "Apple Juice 200ml", "defaultUom": "CASE"},
  {"sku": "JUICE-MANGO-500", "name": "Mango Juice 500ml", "defaultUom": "CASE"},
  {"sku": "ENERGY-250", "name": "Energy Drink 250ml", "defaultUom": "CASE"},
  {"sku": "ENERGY-500", "name": "Energy Drink 500ml", "defaultUom": "CASE"},
  {"sku": "TEA-ICED-330", "name": "Iced Tea Lemon 330ml", "defaultUom": "CASE"},
  {"sku": "TEA-ICED-500", "name": "Iced Tea Peach 500ml", "defaultUom": "CASE"},
  {"sku": "MILK-CHOCO-200", "name": "Chocolate Milk 200ml", "defaultUom": "CASE"},
  {"sku": "MILK-ALMOND-200", "name": "Almond Milk 200ml", "defaultUom": "CASE"}
];

// POSM data
const posmItems = [
  {"code": "STAND-01", "description": "Floor Stand"},
  {"code": "STAND-02", "description": "Countertop Stand"},
  {"code": "STAND-03", "description": "Endcap Display Stand"},
  {"code": "WOB-10", "description": "Shelf Wobbler Small"},
  {"code": "WOB-20", "description": "Shelf Wobbler Large"},
  {"code": "BANNER-01", "description": "Vertical Banner"},
  {"code": "BANNER-02", "description": "Horizontal Banner"},
  {"code": "POSTER-01", "description": "A3 Poster"},
  {"code": "POSTER-02", "description": "A1 Poster"},
  {"code": "DANGLER-01", "description": "Ceiling Dangler"},
  {"code": "HOLDER-01", "description": "Leaflet Holder"},
  {"code": "NEON-01", "description": "Neon Sign Board"},
  {"code": "LIGHTBOX-01", "description": "LED Lightbox Display"},
  {"code": "MAT-01", "description": "Floor Branding Mat"},
  {"code": "TENT-01", "description": "Promotional Tent"}
];

// Demo users - passwords will be hashed in the function
const users = [
  {
    id: "lsr-demo-user",
    name: "Van Sales Rep",
    email: "lsr@demo.com",
    password: "password123",
    role: "LSR"
  },
  {
    id: "logistics-demo-user",
    name: "Logistics Agent",
    email: "logistics@demo.com",
    password: "password123",
    role: "LOGISTICS"
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Product.deleteMany({});
    await Posm.deleteMany({});
    await User.deleteMany({});
    
    // Hash passwords for users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );
    
    // Insert new data
    await Product.insertMany(products);
    await Posm.insertMany(posmItems);
    await User.insertMany(hashedUsers);
    
    console.log("✅ Seed data inserted successfully");
    console.log(`📦 Products: ${products.length}`);
    console.log(`🎯 POSM Items: ${posmItems.length}`);
    console.log(`👥 Users: ${users.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();