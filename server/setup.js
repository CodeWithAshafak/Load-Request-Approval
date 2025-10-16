import fs from 'fs';
import path from 'path';

const envContent = `MONGODB_URI=mongodb://localhost:27017/sfa-system
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the JWT_SECRET for production use.');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
