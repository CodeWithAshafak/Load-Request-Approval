# 🚀 Deployment Checklist

## Backend (Render) Configuration

### Environment Variables Required:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secure-random-jwt-secret
PORT=5000
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Build Settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18.x or higher

### Important Notes:
- ✅ Make sure MongoDB Atlas allows connections from Render's IP (0.0.0.0/0 for all IPs)
- ✅ Backend URL: `https://load-request-approval.onrender.com`
- ⚠️ Render free tier spins down after inactivity (may take 30-60s to wake up)

---

## Frontend (Vercel) Configuration

### Environment Variables (Optional):
```
VITE_API_URL=https://load-request-approval.onrender.com
```

### Build Settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Root Directory:
- Set to `client` if deploying from monorepo

---

## Post-Deployment Testing

### 1. Test Backend Health
```bash
curl https://load-request-approval.onrender.com/health
```
Expected: `{"status":"OK","timestamp":"...","uptime":...}`

### 2. Test Login Endpoint
```bash
curl -X POST https://load-request-approval.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lsr@demo.com","password":"password123"}'
```

### 3. Test Frontend
- Visit your Vercel URL
- Try demo login for LSR
- Try demo login for LOGISTICS
- Check browser console for CORS errors

---

## Common Issues & Solutions

### ❌ CORS Error
**Problem**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solution**: 
1. Add your Vercel URL to Render environment variables:
   - `CORS_ORIGIN=https://your-app.vercel.app`
   - `FRONTEND_URL=https://your-app.vercel.app`
2. Redeploy backend on Render

### ❌ Route Not Found
**Problem**: Login redirects to wrong route

**Solution**: Already fixed in latest code! Make sure to:
1. Push changes to GitHub
2. Redeploy both frontend and backend

### ❌ 500 Internal Server Error
**Problem**: Backend crashes or database connection fails

**Solution**:
1. Check Render logs for errors
2. Verify `MONGODB_URI` is correct
3. Ensure MongoDB Atlas whitelist includes Render IPs

### ❌ Slow First Load
**Problem**: First request takes 30-60 seconds

**Solution**: This is normal for Render free tier (cold start). Consider:
- Upgrading to paid plan
- Using a keep-alive service (ping every 10 minutes)

---

## Database Seeding

If you need to seed demo users on production:

```bash
# SSH into Render or run locally with production DB
npm run seed:users
```

Demo credentials:
- **LSR**: lsr@demo.com / password123
- **LOGISTICS**: logistics@demo.com / password123

---

## Monitoring

### Check Backend Logs (Render):
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab

### Check Frontend Logs (Vercel):
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → Select deployment → "Functions" tab

---

## Security Recommendations

- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable MongoDB Atlas IP whitelist (don't use 0.0.0.0/0 in production)
- [ ] Add rate limiting to API endpoints
- [ ] Enable HTTPS only (both platforms do this by default)
- [ ] Set secure cookie flags if using sessions
- [ ] Add helmet.js for security headers

---

## Next Steps

1. ✅ Push updated CORS configuration to GitHub
2. ✅ Redeploy backend on Render
3. ✅ Add environment variables on Render
4. ✅ Test login functionality
5. ✅ Monitor for errors in first 24 hours
