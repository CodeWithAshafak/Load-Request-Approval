import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

console.log('Starting server...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

connectDB().then(() => {
  console.log('Database connected, starting server...');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
