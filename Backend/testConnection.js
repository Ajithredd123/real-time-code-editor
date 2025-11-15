// testConnection.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-code';

console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', MONGODB_URI.replace(/\/\/.*:.*@/, '//****:****@')); // Hide password

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  
  // Create a test document
  const testSchema = new mongoose.Schema({ test: String });
  const TestModel = mongoose.model('Test', testSchema);
  
  return TestModel.create({ test: 'Connection successful!' });
})
.then((doc) => {
  console.log('✅ Test document created:', doc);
  console.log('\n🎉 MongoDB is working perfectly!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('\nTroubleshooting:');
  console.error('1. Check if MongoDB is running (for local)');
  console.error('2. Verify connection string in .env file');
  console.error('3. Check network access (for Atlas)');
  console.error('4. Verify username and password');
  process.exit(1);
});