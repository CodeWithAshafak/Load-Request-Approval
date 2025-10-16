import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import LoadRequest from "./models/LoadRequest.js";
import User from "./models/User.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/winit-new-task";

async function debugRequests() {
  try {
    console.log('\n🔍 === DEBUGGING LSR REQUESTS ISSUE ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // 1. Check Users
    console.log('📋 Step 1: Checking Users...');
    const users = await User.find({});
    console.log(`   Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} | Role: ${user.role} | ID: ${user.id}`);
    });
    console.log('');

    // 2. Check Load Requests
    console.log('📋 Step 2: Checking Load Requests...');
    const allRequests = await LoadRequest.find({});
    console.log(`   Total requests in database: ${allRequests.length}`);
    
    if (allRequests.length > 0) {
      console.log('\n   Request Details:');
      allRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. Request #${req.requestNumber || 'N/A'}`);
        console.log(`      - ID: ${req.id || req._id}`);
        console.log(`      - LSR ID: ${req.lsrId}`);
        console.log(`      - Status: ${req.status}`);
        console.log(`      - Created: ${req.createdAt}`);
        console.log(`      - Submitted: ${req.submittedAt || 'Not submitted'}`);
        console.log(`      - Products: ${req.commercialProducts?.length || 0}`);
        console.log(`      - POSM: ${req.posmItems?.length || 0}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  NO REQUESTS FOUND IN DATABASE!');
      console.log('   This is why the logistics dashboard is empty.\n');
    }

    // 3. Check SUBMITTED requests specifically
    console.log('📋 Step 3: Checking SUBMITTED Requests...');
    const submittedRequests = await LoadRequest.find({ status: 'SUBMITTED' });
    console.log(`   SUBMITTED requests: ${submittedRequests.length}`);
    
    if (submittedRequests.length > 0) {
      console.log('   ✅ Found SUBMITTED requests - these should appear in logistics dashboard');
      submittedRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.requestNumber} - LSR: ${req.lsrId}`);
      });
    } else {
      console.log('   ⚠️  NO SUBMITTED REQUESTS FOUND!');
      console.log('   Logistics dashboard will be empty because there are no SUBMITTED requests.');
    }
    console.log('');

    // 4. Check by status breakdown
    console.log('📋 Step 4: Request Status Breakdown...');
    const statusCounts = await LoadRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('   Status distribution:');
    statusCounts.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}`);
    });
    console.log('');

    // 5. Check logistics user
    console.log('📋 Step 5: Checking Logistics User...');
    const logisticsUser = await User.findOne({ role: 'LOGISTICS' });
    if (logisticsUser) {
      console.log(`   ✅ Logistics user found: ${logisticsUser.email}`);
      console.log(`      - Role: ${logisticsUser.role}`);
      console.log(`      - ID: ${logisticsUser.id}`);
    } else {
      console.log('   ❌ NO LOGISTICS USER FOUND!');
      console.log('   This could cause authentication issues.');
    }
    console.log('');

    // 6. Diagnosis
    console.log('🔬 === DIAGNOSIS ===\n');
    
    if (allRequests.length === 0) {
      console.log('❌ ROOT CAUSE: No requests exist in the database');
      console.log('\n💡 SOLUTION:');
      console.log('   1. Login as LSR user (lsr@demo.com)');
      console.log('   2. Create a new request');
      console.log('   3. Add products and/or POSM items');
      console.log('   4. Submit the request');
      console.log('   5. Then login as logistics user to see it\n');
    } else if (submittedRequests.length === 0) {
      console.log('❌ ROOT CAUSE: Requests exist but none are SUBMITTED');
      console.log(`   Found ${allRequests.length} request(s) with status:`);
      allRequests.forEach(req => {
        console.log(`   - ${req.requestNumber}: ${req.status}`);
      });
      console.log('\n💡 SOLUTION:');
      console.log('   1. Login as LSR user');
      console.log('   2. Go to existing draft requests');
      console.log('   3. Submit them');
      console.log('   OR create and submit a new request\n');
    } else if (!logisticsUser) {
      console.log('❌ ROOT CAUSE: No LOGISTICS user in database');
      console.log('\n💡 SOLUTION:');
      console.log('   Run: npm run seed');
      console.log('   This will create the logistics user\n');
    } else {
      console.log('✅ Everything looks good in the database!');
      console.log(`   - ${submittedRequests.length} SUBMITTED request(s) found`);
      console.log('   - Logistics user exists');
      console.log('\n💡 If dashboard is still empty, check:');
      console.log('   1. Browser console for errors');
      console.log('   2. Network tab for API call to /api/requests?status=SUBMITTED');
      console.log('   3. Verify you\'re logged in as logistics@demo.com');
      console.log('   4. Check localStorage for valid token\n');
    }

    console.log('=== DEBUG COMPLETE ===\n');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during debug:', error);
    process.exit(1);
  }
}

debugRequests();
