const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory storage
let casePackages = [];
let nextId = 1;

// Create case package endpoint
app.post('/api/case-packages', (req, res) => {
  console.log('=== Received case package creation request ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const newPackage = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  casePackages.push(newPackage);
  
  console.log('Created case package with ID:', newPackage.id);
  console.log('Total packages in memory:', casePackages.length);
  
  // Return response in the format expected by frontend
  res.json({
    code: 200,
    message: 'Success',
    data: newPackage
  });
});

// Get case packages list
app.get('/api/case-packages', (req, res) => {
  console.log('=== Fetching case packages list ===');
  console.log('Total packages:', casePackages.length);
  
  res.json({
    code: 200,
    message: 'Success',
    data: {
      content: casePackages,
      totalElements: casePackages.length,
      totalPages: 1,
      number: 0,
      size: 20
    }
  });
});

// Get case package by ID
app.get('/api/case-packages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pkg = casePackages.find(p => p.id === id);
  
  console.log(`=== Fetching case package with ID: ${id} ===`);
  
  if (pkg) {
    res.json({
      code: 200,
      message: 'Success',
      data: pkg
    });
  } else {
    res.status(404).json({ 
      code: 404,
      message: 'Case package not found',
      data: null
    });
  }
});

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/case-packages - Create case package');
  console.log('  GET  /api/case-packages - List case packages');
  console.log('  GET  /api/case-packages/:id - Get case package by ID');
});