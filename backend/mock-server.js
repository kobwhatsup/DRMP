const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory storage with mock data
let casePackages = [
  {
    id: 40,
    packageCode: 'PKG000040',
    packageName: '消费贷4',
    status: 'PUBLISHED',
    assignmentType: 'MANUAL',
    caseCount: 150,
    totalAmount: 115000,
    remainingAmount: 115000,
    expectedRecoveryRate: 0.05,
    expectedDisposalDays: 60,
    preferredDisposalMethods: 'LITIGATION,MEDIATION',
    sourceOrgId: 1,
    sourceOrgName: '中银消费',
    entrustStartDate: '2025-09-11',
    entrustEndDate: '2025-10-31',
    createdAt: '2025-09-11T09:00:00Z',
    updatedAt: '2025-09-11T09:00:00Z'
  },
  {
    id: 86,
    packageCode: 'PKG000086', 
    packageName: '信用贷-4',
    status: 'PENDING_ASSIGNMENT',
    assignmentType: 'SMART',
    caseCount: 80,
    totalAmount: 461000,
    remainingAmount: 461000,
    expectedRecoveryRate: 0.21,
    expectedDisposalDays: 90,
    preferredDisposalMethods: 'NEGOTIATION,MEDIATION',
    sourceOrgId: 1,
    sourceOrgName: '中银消费',
    entrustStartDate: '2025-09-11',
    entrustEndDate: '2025-10-31',
    createdAt: '2025-09-11T10:00:00Z',
    updatedAt: '2025-09-11T10:00:00Z'
  }
];
let nextId = 87;

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

// Add v1 endpoints (alias for compatibility)
app.get('/api/v1/case-packages', (req, res) => {
  console.log('=== Fetching case packages list (v1) ===');
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

app.get('/api/v1/case-packages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pkg = casePackages.find(p => p.id === id);
  
  console.log(`=== Fetching case package with ID: ${id} (v1) ===`);
  
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

app.post('/api/v1/case-packages', (req, res) => {
  console.log('=== Received case package creation request (v1) ===');
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
  
  res.json({
    code: 200,
    message: 'Success',
    data: newPackage
  });
});

// Add statistics endpoint
app.get('/api/v1/case-packages/statistics', (req, res) => {
  const statistics = {
    total: casePackages.length,
    bidding: casePackages.filter(p => p.status === 'BIDDING').length,
    inProgress: casePackages.filter(p => p.status === 'IN_PROGRESS').length,
    avgRecoveryRate: casePackages.reduce((sum, p) => sum + (p.expectedRecoveryRate || 0), 0) / casePackages.length * 100
  };
  
  res.json({
    code: 200,
    message: 'Success',
    data: statistics
  });
});

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/case-packages - Create case package');
  console.log('  GET  /api/case-packages - List case packages');
  console.log('  GET  /api/case-packages/:id - Get case package by ID');
  console.log('  POST /api/v1/case-packages - Create case package (v1)');
  console.log('  GET  /api/v1/case-packages - List case packages (v1)');
  console.log('  GET  /api/v1/case-packages/:id - Get case package by ID (v1)');
  console.log('  GET  /api/v1/case-packages/statistics - Get statistics (v1)');
});