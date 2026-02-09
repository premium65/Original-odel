// Simple production server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');

// Load environment variables
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not available, using process.env directly');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Partner API is running',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes placeholder
app.use('/app/auth', (req, res) => {
  res.json({ message: 'Auth endpoint - TODO: Implement full routes' });
});

app.use('/app/user', (req, res) => {
  res.json({ message: 'User endpoint - TODO: Implement full routes' });
});

app.use('/app/admin', (req, res) => {
  res.json({ message: 'Admin endpoint - TODO: Implement full routes' });
});

// Start server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
