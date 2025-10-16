import express from "express";
import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";

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

// GET Notifications for a user
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId })
      .sort({ createdOn: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT Mark notification as read
router.put("/:notificationId/read", authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({ notificationId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    notification.status = "Read";
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE Delete notification
router.delete("/:notificationId", authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({ notificationId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
