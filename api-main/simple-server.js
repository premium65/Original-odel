// Minimal Express server for Render deployment
const http = require('http');

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Basic routing
  const url = req.url;
  
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Travel Partner API is running',
      status: 'active',
      timestamp: new Date().toISOString(),
      port: PORT
    }));
  } else if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'travelpartner-api'
    }));
  } else if (url.startsWith('/app/auth')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Auth endpoint - TODO: Implement full authentication',
      endpoint: url
    }));
  } else if (url.startsWith('/app/user')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'User endpoint - TODO: Implement full user management',
      endpoint: url
    }));
  } else if (url.startsWith('/app/admin')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Admin endpoint - TODO: Implement full admin panel',
      endpoint: url
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not Found',
      message: 'Endpoint not available',
      url: url
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Base URL: http://localhost:${PORT}/`);
});
