import express from "express";
import LoadRequest from "../models/LoadRequest.js";
import Product from "../models/Product.js";
import Posm from "../models/Posm.js";
import User from "../models/User.js";
import WarehouseStock from "../models/WarehouseStock.js";

const router = express.Router();

// JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// GET /requests?lsrId=:id → list of requests for LSR
router.get("/requests", authenticateToken, async (req, res) => {
  try {
    const { lsrId, status } = req.query;
    
    console.log('📥 GET /requests called');
    console.log('   User Role:', req.userRole);
    console.log('   User ID:', req.userId);
    console.log('   Query params:', { lsrId, status });
    
    let query = {};
    
    if (req.userRole === 'LSR') {
      query.lsrId = lsrId || req.userId;
      console.log('   Building LSR query:', query);
    } else if (req.userRole === 'LOGISTICS') {
      if (status) {
        query.status = status;
      }
      console.log('   Building LOGISTICS query:', query);
    } else {
      console.log('   ⚠️  Unknown role:', req.userRole);
    }
    
    const requests = await LoadRequest.find(query).sort({ createdAt: -1 });
    console.log('   📊 Found', requests.length, 'request(s)');
    
    if (requests.length > 0) {
      console.log('   First request:', {
        id: requests[0].id,
        requestNumber: requests[0].requestNumber,
        status: requests[0].status,
        lsrId: requests[0].lsrId
      });
    }
    
    res.json(requests);
  } catch (err) {
    console.error('❌ Error in GET /requests:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /requests → create draft request
router.post("/requests", authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'LSR') {
      return res.status(403).json({ message: 'Only LSR can create requests' });
    }
    
    const { route, notes, priority, commercialProducts = [], posmItems = [] } = req.body;
    
    const loadRequest = new LoadRequest({
      lsrId: req.userId,
      route,
      notes,
      priority: priority || 'MEDIUM', // Use provided priority or default to MEDIUM
      status: 'DRAFT',
      commercialProducts,
      posmItems
    });
    
    console.log('Creating request with data:', {
      lsrId: req.userId,
      route,
      notes,
      status: 'DRAFT',
      commercialProducts,
      posmItems
    });
    
    console.log('Request number before save:', loadRequest.requestNumber);
    
    await loadRequest.save();
    
    console.log('Request number after save:', loadRequest.requestNumber);
    res.status(201).json(loadRequest);
  } catch (err) {
    console.error('Create request error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation Error',
        errors 
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Request number already exists. Please try again.' 
      });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /requests/:id → update draft
router.patch("/requests/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const request = await LoadRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only draft requests can be updated' });
    }
    
    if (req.userRole === 'LSR' && request.lsrId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    Object.assign(request, updateData);
    await request.save();
    
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /requests/:id/submit → set status → SUBMITTED
router.post("/requests/:id/submit", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.userRole !== 'LSR') {
      return res.status(403).json({ message: 'Only LSR can submit requests' });
    }
    
    const request = await LoadRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only draft requests can be submitted' });
    }
    
    if (request.lsrId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Validate that request has at least one commercial product or POSM item
    if (request.commercialProducts.length === 0 && request.posmItems.length === 0) {
      return res.status(400).json({ message: 'Request must contain at least one commercial product or POSM item' });
    }
    
    request.status = 'SUBMITTED';
    request.submittedAt = new Date();
    await request.save();
    
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /requests/:id/approve → set APPROVED
router.post("/requests/:id/approve", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { commercialProducts, posmItems } = req.body;
    
    if (req.userRole !== 'LOGISTICS') {
      return res.status(403).json({ message: 'Only Logistics agents can approve requests' });
    }
    
    const request = await LoadRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'SUBMITTED') {
      return res.status(400).json({ message: 'Only submitted requests can be approved' });
    }
    
    // Update quantities if modified by logistics
    if (commercialProducts && Array.isArray(commercialProducts)) {
      request.commercialProducts = commercialProducts;
      console.log('✏️  Logistics modified commercial products quantities');
    }
    if (posmItems && Array.isArray(posmItems)) {
      request.posmItems = posmItems;
      console.log('✏️  Logistics modified POSM items quantities');
    }
    
    request.status = 'APPROVED';
    request.decidedAt = new Date();
    request.approverId = req.userId;
    await request.save();
    
    console.log(`✅ Request ${request.requestNumber} approved by ${req.userId}`);
    res.json(request);
  } catch (err) {
    console.error('❌ Approve error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /requests/:id/reject → set REJECTED
router.post("/requests/:id/reject", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (req.userRole !== 'LOGISTICS') {
      return res.status(403).json({ message: 'Only Logistics agents can reject requests' });
    }
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const request = await LoadRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'SUBMITTED') {
      return res.status(400).json({ message: 'Only submitted requests can be rejected' });
    }
    
    request.status = 'REJECTED';
    request.decidedAt = new Date();
    request.approverId = req.userId;
    request.decisionReason = reason;
    await request.save();
    
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /catalog/products → product list
router.get("/catalog/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ sku: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /products/search → search products by name or SKU
router.get("/products/search", async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    console.log('🔍 Searching products with query:', query);
    
    // Search by SKU or name (case-insensitive)
    const products = await Product.find({
      $or: [
        { sku: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    }).limit(50);
    
    console.log('📦 Found', products.length, 'products');
    
    // Enrich products with warehouse stock data
    const enrichedProducts = await Promise.all(products.map(async (product) => {
      // Get warehouse stock for this product
      const stock = await WarehouseStock.findOne({ skuId: product.sku });
      
      const availableQty = stock?.availableQty || 0;
      const reservedQty = stock?.reservedQty || 0;
      const totalStock = availableQty + reservedQty;
      
      // Generate mock data for fields not in database
      const avgSales = Math.floor(Math.random() * 30) + 10; // Random between 10-40
      const mrp = product.unitPrice || Math.floor(Math.random() * 500) + 50; // Use unitPrice or random
      
      return {
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        mrp: mrp,
        stock: totalStock,
        reserved: reservedQty,
        available: availableQty,
        avgSales: avgSales,
        defaultUom: product.defaultUom
      };
    }));
    
    res.json(enrichedProducts);
  } catch (err) {
    console.error('❌ Product search error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /catalog/posm → posm list
router.get("/catalog/posm", async (req, res) => {
  try {
    const posmItems = await Posm.find().sort({ code: 1 });
    res.json(posmItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /posm/search → search POSM items by code or description
router.get("/posm/search", async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    console.log('🔍 Searching POSM items with query:', query);
    
    // Search by code or description (case-insensitive)
    const posmItems = await Posm.find({
      $or: [
        { code: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).limit(50);
    
    console.log('📦 Found', posmItems.length, 'POSM items');
    
    res.json(posmItems);
  } catch (err) {
    console.error('❌ POSM search error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /routes → get list of available routes
router.get("/routes", async (req, res) => {
  try {
    console.log('🛣️  Fetching routes list');
    
    // Indian city routes with codes
    const routes = [
      { id: 1, name: 'Mumbai Central Route', code: 'MUM-C-01', city: 'Mumbai', region: 'West' },
      { id: 2, name: 'Mumbai Suburban Route', code: 'MUM-S-01', city: 'Mumbai', region: 'West' },
      { id: 3, name: 'Delhi NCR Route', code: 'DEL-NCR-01', city: 'Delhi', region: 'North' },
      { id: 4, name: 'Delhi South Route', code: 'DEL-S-01', city: 'Delhi', region: 'North' },
      { id: 5, name: 'Bangalore East Route', code: 'BLR-E-01', city: 'Bangalore', region: 'South' },
      { id: 6, name: 'Bangalore West Route', code: 'BLR-W-01', city: 'Bangalore', region: 'South' },
      { id: 7, name: 'Pune West Route', code: 'PUN-W-01', city: 'Pune', region: 'West' },
      { id: 8, name: 'Pune East Route', code: 'PUN-E-01', city: 'Pune', region: 'West' },
      { id: 9, name: 'Hyderabad South Route', code: 'HYD-S-01', city: 'Hyderabad', region: 'South' },
      { id: 10, name: 'Hyderabad North Route', code: 'HYD-N-01', city: 'Hyderabad', region: 'South' },
      { id: 11, name: 'Chennai North Route', code: 'CHN-N-01', city: 'Chennai', region: 'South' },
      { id: 12, name: 'Chennai South Route', code: 'CHN-S-01', city: 'Chennai', region: 'South' },
      { id: 13, name: 'Kolkata Metro Route', code: 'KOL-M-01', city: 'Kolkata', region: 'East' },
      { id: 14, name: 'Kolkata North Route', code: 'KOL-N-01', city: 'Kolkata', region: 'East' },
      { id: 15, name: 'Ahmedabad City Route', code: 'AMD-C-01', city: 'Ahmedabad', region: 'West' },
      { id: 16, name: 'Ahmedabad East Route', code: 'AMD-E-01', city: 'Ahmedabad', region: 'West' },
      { id: 17, name: 'Jaipur City Route', code: 'JAI-C-01', city: 'Jaipur', region: 'North' },
      { id: 18, name: 'Lucknow Central Route', code: 'LKO-C-01', city: 'Lucknow', region: 'North' },
      { id: 19, name: 'Chandigarh Route', code: 'CHD-01', city: 'Chandigarh', region: 'North' },
      { id: 20, name: 'Indore City Route', code: 'IDR-C-01', city: 'Indore', region: 'Central' },
      { id: 21, name: 'Bhopal Route', code: 'BHO-01', city: 'Bhopal', region: 'Central' },
      { id: 22, name: 'Nagpur Route', code: 'NAG-01', city: 'Nagpur', region: 'Central' },
      { id: 23, name: 'Surat City Route', code: 'SRT-C-01', city: 'Surat', region: 'West' },
      { id: 24, name: 'Vadodara Route', code: 'VAD-01', city: 'Vadodara', region: 'West' },
      { id: 25, name: 'Coimbatore Route', code: 'COI-01', city: 'Coimbatore', region: 'South' }
    ];
    
    console.log(`✅ Returning ${routes.length} routes`);
    res.json(routes);
  } catch (err) {
    console.error('❌ Routes fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/login → JWT authentication with bcrypt
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Check password with bcrypt
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.default.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      userId: user.id,
      userName: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /lsr/:userId/recommended-load → get recommended products and POSM for LSR
router.get("/lsr/:userId/recommended-load", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📦 Fetching recommended load for user:', userId);
    
    // Get user's recent requests to determine frequently ordered items
    const recentRequests = await LoadRequest.find({ 
      lsrId: userId,
      status: { $in: ['APPROVED', 'SUBMITTED'] }
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    console.log('📊 Found', recentRequests.length, 'recent requests');
    
    // Aggregate frequently ordered products
    const productFrequency = {};
    const posmFrequency = {};
    
    recentRequests.forEach(request => {
      // Count commercial products
      request.commercialProducts.forEach(product => {
        if (!productFrequency[product.sku]) {
          productFrequency[product.sku] = {
            sku: product.sku,
            name: product.name,
            uom: product.uom,
            count: 0,
            totalQty: 0
          };
        }
        productFrequency[product.sku].count++;
        productFrequency[product.sku].totalQty += product.qty;
      });
      
      // Count POSM items
      request.posmItems.forEach(item => {
        if (!posmFrequency[item.code]) {
          posmFrequency[item.code] = {
            code: item.code,
            description: item.description,
            count: 0,
            totalQty: 0
          };
        }
        posmFrequency[item.code].count++;
        posmFrequency[item.code].totalQty += item.qty;
      });
    });
    
    // Get top 3 products (ordered by frequency)
    const recommendedProducts = Object.values(productFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => {
        const avgQty = Math.ceil(item.totalQty / item.count);
        return {
          sku: item.sku,
          name: item.name,
          uom: item.uom,
          recommendedQty: avgQty, // Average quantity
          preOrderQty: Math.ceil(avgQty * 0.15), // 15% of recommended as pre-order
          bufferQty: Math.ceil(avgQty * 0.10) // 10% of recommended as buffer
        };
      });
    
    // Get top 3 POSM items (ordered by frequency)
    const recommendedPosm = Object.values(posmFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => ({
        code: item.code,
        description: item.description,
        qty: Math.ceil(item.totalQty / item.count) // Average quantity
      }));
    
    console.log('✅ Recommended products:', recommendedProducts.length);
    console.log('✅ Recommended POSM:', recommendedPosm.length);
    
    // If no recommendations found (new user), provide some popular default items
    let finalProducts = recommendedProducts;
    let finalPosm = recommendedPosm;
    
    if (recommendedProducts.length === 0) {
      console.log('ℹ️  No order history found, providing default recommendations');
      // Get 3 popular products from the catalog
      const popularProducts = await Product.find({ isActive: true })
        .sort({ sku: 1 })
        .limit(3);
      
      finalProducts = popularProducts.map(product => ({
        sku: product.sku,
        name: product.name,
        uom: product.defaultUom || 'UNIT',
        recommendedQty: 100, // Default recommended quantity
        preOrderQty: 15, // 15% of default recommended (15 units)
        bufferQty: 10 // 10% of default recommended (10 units)
      }));
    }
    
    if (recommendedPosm.length === 0) {
      // Get 3 POSM items from the catalog
      const popularPosm = await Posm.find()
        .sort({ code: 1 })
        .limit(3);
      
      finalPosm = popularPosm.map(item => ({
        code: item.code,
        description: item.description,
        qty: 5 // Default quantity
      }));
    }
    
    res.json({
      commercialProducts: finalProducts,
      posmItems: finalPosm
    });
  } catch (err) {
    console.error('❌ Error fetching recommended load:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
