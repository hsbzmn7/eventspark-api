const fs = require('fs');
const path = require('path');

// Default environment variables
const defaultEnv = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eventspark

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: For production deployment
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventspark
# JWT_SECRET=your-production-jwt-secret
`;

const envPath = path.join(__dirname, '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    console.log('📝 Please make sure it contains the following variables:');
    console.log('   - MONGODB_URI');
    console.log('   - JWT_SECRET');
    console.log('   - PORT (optional, defaults to 5000)');
    console.log('   - NODE_ENV (optional, defaults to development)');
} else {
    // Create .env file
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Created .env file with default configuration');
    console.log('⚠️  Please update the JWT_SECRET with a secure random string');
    console.log('⚠️  Update MONGODB_URI if you\'re using a different database');
}

console.log('\n🚀 To start the server:');
console.log('   npm install (if not already done)');
console.log('   npm start');
console.log('\n🔧 For development with auto-restart:');
console.log('   npm run dev'); 