# Load Service Request (LSR) & Approval System

A production-ready MERN stack application that allows two roles—LSR (Van Sales Rep) and Logistics Approval Agent—to manage and approve Load Service Requests (LSRs).

## 🎯 Features

### LSR (Van Sales Rep)
- ✅ View list of own load requests (with status)
- ✅ Create a new request with wizard interface
- ✅ Add Commercial Products
- ✅ Add POSM Items
- ✅ Submit the request for approval
- ✅ View history of submitted/approved/rejected requests
- ✅ Real-time status updates
- ✅ Request validation and error handling

### Logistics Approval Agent
- ✅ View pending requests
- ✅ Approve or reject requests (with reason for rejection)
- ✅ View list of approved requests
- ✅ Bulk operations
- ✅ Advanced filtering and search

## 🏗️ Tech Stack

- **Frontend**: React 19, Redux Toolkit, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT-based authentication with bcrypt
- **Database**: MongoDB with comprehensive indexing
- **Styling**: Tailwind CSS with responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lsr-approval-system
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # In server directory, create .env file
   cd ../server
   cp env.example .env
   ```

   Configure your environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lsr-system
   JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

4. **Seed the database**
   ```bash
   cd server
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Start server (in server directory)
   npm start

   # Start client (in client directory, new terminal)
   cd ../client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 👥 Demo Users

The system comes with pre-configured demo users:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| LSR | lsr@demo.com | password123 | `/lsr` |
| Logistics | logistics@demo.com | password123 | `/logistics` |

## 📋 Application Routes

- `/login` – Role-based login
- `/lsr` – LSR Dashboard (load request grid)
- `/lsr/new` – Wizard to create/edit requests
- `/lsr/history` – History view
- `/logistics` – Pending approval center
- `/logistics/approved` – Approved list

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - JWT-based login with bcrypt

### Load Requests
- `GET /api/requests?lsrId=:id` - List requests for LSR
- `POST /api/requests` - Create draft request
- `PATCH /api/requests/:id` - Update draft
- `POST /api/requests/:id/submit` - Submit request
- `GET /api/requests?status=SUBMITTED` - Pending requests for Logistics
- `POST /api/requests/:id/approve` - Approve request
- `POST /api/requests/:id/reject` - Reject request
- `GET /api/requests?status=APPROVED` - Approved list

### Catalog
- `GET /api/catalog/products` - Product list
- `GET /api/catalog/posm` - POSM list

### Health
- `GET /health` - Health check endpoint

## 📊 Data Models

### Enhanced Load Request Structure
```javascript
{
  id: "string",
  requestNumber: "string",
  lsrId: "string",
  lsrName: "string",
  route: "string",
  notes: "string",
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED",
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  createdAt: "date",
  submittedAt: "date",
  decidedAt: "date",
  approverId: "string",
  approverName: "string",
  decisionReason: "string",
  totalValue: "number",
  isUrgent: "boolean",
  deliveryDate: "date",
  specialInstructions: "string",
  commercialProducts: [
    {
      id: "string",
      sku: "string",
      name: "string",
      uom: "CASE" | "UNIT",
      qty: "number",
      unitPrice: "number",
      totalValue: "number"
    }
  ],
  posmItems: [
    {
      id: "string",
      code: "string",
      description: "string",
      qty: "number",
      unitValue: "number",
      totalValue: "number"
    }
  ]
}
```

## 🎨 UI Features

### Modern Design Elements
- ✅ Clean, minimalist interface
- ✅ Color-coded status indicators
- ✅ Interactive hover effects
- ✅ Smooth transitions and animations
- ✅ Mobile-responsive design
- ✅ Accessibility features (keyboard navigation)

### Dashboard Components
- ✅ Collapsible sidebar navigation
- ✅ Real-time notification bell
- ✅ Sortable and filterable data tables
- ✅ Modal dialogs for forms
- ✅ Progress tracking indicators
- ✅ Status badges and indicators

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Input validation (frontend and backend)
- ✅ CORS configuration
- ✅ Error handling and logging
- ✅ Rate limiting (configurable)

## 📈 Performance & Monitoring

### Frontend Optimizations
- ✅ React 19 with modern hooks
- ✅ Redux Toolkit for efficient state management
- ✅ Component lazy loading
- ✅ Optimized re-renders
- ✅ Centralized API configuration

### Backend Optimizations
- ✅ Efficient database queries
- ✅ Proper indexing
- ✅ Connection pooling
- ✅ Error handling
- ✅ Request validation

## 🚀 Production Deployment

### Environment Setup
1. **Environment Variables**: Configure production environment variables
2. **Database**: Set up production MongoDB instance
3. **Build Process**: Run `npm run build` for client
4. **Server Deployment**: Deploy Node.js server to production
5. **Domain Configuration**: Set up domain and SSL certificates

### Production Checklist
- [ ] Update JWT_SECRET to a strong, unique value
- [ ] Configure production MongoDB URI
- [ ] Set CORS_ORIGIN to your production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up error tracking

## 🛠️ Development

### Available Scripts

#### Server
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

#### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
project-root/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── hooks/          # Custom React hooks
│   │   ├── Config.jsx      # API configuration
│   │   └── App.jsx         # Main App component
│   └── package.json
├── server/                 # Node.js Backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── config/             # Database configuration
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Clear localStorage and re-login

3. **CORS Errors**
   - Update CORS_ORIGIN in .env
   - Check frontend URL matches CORS configuration

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for efficient Load Service Request management**

*Production-ready MERN stack application with comprehensive error handling, security features, and modern UI/UX.*