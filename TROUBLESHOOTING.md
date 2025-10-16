# Troubleshooting Guide - Search Not Working

## Issue: No data appearing in search for Commercial Products or POSM Items

### Steps to Fix:

### 1. **Start the Backend Server**
```bash
cd server
npm run dev
```
- Server should start on `http://localhost:5000`
- You should see: `🚀 Server running on port 5000`

### 2. **Seed the Database** (If no data exists)
```bash
cd server
npm run seed
```
- This will populate the database with sample products and POSM items
- You should see:
  - ✅ Seed data inserted successfully
  - 📦 Products: 15
  - 🎯 POSM Items: 15
  - 👥 Users: 2

### 3. **Test the API Endpoints**

**Test Products Search:**
Open browser or use curl:
```
http://localhost:5000/api/products/search?query=cola
```

**Test POSM Search:**
```
http://localhost:5000/api/posm/search?query=stand
```

### 4. **Check Browser Console**
- Open Developer Tools (F12)
- Go to Console tab
- Click "Add Commercial Products" or "Add POSM Items"
- Type a search term (e.g., "cola" or "stand")
- Click Search
- Check for any error messages

### 5. **Common Issues**

#### Issue: "Cannot connect to server"
**Solution:** Make sure backend is running on port 5000
```bash
cd server
npm run dev
```

#### Issue: "No results found"
**Solution:** Run the seed script to add data
```bash
cd server
npm run seed
```

#### Issue: CORS Error
**Solution:** Check that CORS is configured in `server/app.js`:
```javascript
app.use(cors({ 
  origin: "http://localhost:5173",
  credentials: true
}));
```

### 6. **Sample Search Terms**

**For Commercial Products:**
- `cola`
- `juice`
- `water`
- `energy`
- `milk`

**For POSM Items:**
- `stand`
- `banner`
- `poster`
- `wobbler`
- `display`

### 7. **Check Database Connection**
Make sure MongoDB is running and the connection string in `.env` is correct:
```
MONGODB_URI=mongodb://localhost:27017/lsr-system
```

### 8. **Verify API Routes**
The search endpoints are:
- `GET /api/products/search?query=<searchTerm>`
- `GET /api/posm/search?query=<searchTerm>`

Both are defined in `server/routes/apiRoutes.js`

---

## Quick Test Checklist
- [ ] Backend server is running (`npm run dev` in server folder)
- [ ] Database has seed data (`npm run seed` in server folder)
- [ ] Frontend is running (`npm run dev` in client folder)
- [ ] Browser console shows no errors
- [ ] API endpoints respond when tested directly in browser
