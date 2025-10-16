import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/winit_demo";

const users = [
  { 
    id: "lsr-demo-user",
    name: "Raj LSR", 
    email: "lsr@demo.com", 
    password: "password123", 
    role: "LSR" 
  },
  { 
    id: "logistics-demo-user",
    name: "Anita Logistics", 
    email: "logistics@demo.com", 
    password: "password123", 
    role: "LOGISTICS" 
  },
  { 
    id: "admin-demo-user",
    name: "Admin User", 
    email: "admin@demo.com", 
    password: "password123", 
    role: "ADMIN" 
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    await User.deleteMany({});
    console.log("🗑️ Old users removed");

    // Hash passwords before inserting
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    await User.insertMany(hashedUsers);
    console.log("✅ Test users inserted");
    console.log(`👥 Users: ${users.length}`);
    console.log("📧 Login credentials:");
    users.forEach(user => {
      console.log(`   - ${user.role}: ${user.email} / password123`);
    });

    mongoose.connection.close();
    console.log("🚪 MongoDB connection closed");
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
};

seedUsers();
