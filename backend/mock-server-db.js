const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database file path
const DB_FILE = path.join(__dirname, 'mock-database.json');

// Initialize or load database
let database = {
  casePackages: [],
  nextId: 1
};

// Load database from file if exists
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      database = JSON.parse(data);
      console.log('✅ Database loaded from file');
      console.log(`   - Case packages: ${database.casePackages.length}`);
      console.log(`   - Next ID: ${database.nextId}`);
    } else {
      saveDatabase();
      console.log('✅ New database created');
    }
  } catch (error) {
    console.error('Error loading database:', error);
    saveDatabase();
  }
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
    console.log('💾 Database saved to file');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Load database on startup
loadDatabase();

// Create case package endpoint
app.post('/api/case-packages', (req, res) => {
  console.log('=== Creating case package ===');
  
  // Ensure data consistency for cases
  let caseCount = req.body.caseCount;
  let totalAmount = req.body.totalAmount;
  
  // If cases are provided, recalculate statistics
  if (req.body.cases && Array.isArray(req.body.cases)) {
    const validCases = req.body.cases.filter(c => c.isValid !== false);
    caseCount = validCases.length;
    totalAmount = validCases.reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
    console.log(`   - Recalculated: ${caseCount} cases, total amount: ${totalAmount}`);
  }
  
  const newPackage = {
    id: database.nextId++,
    ...req.body,
    caseCount: caseCount,
    totalAmount: totalAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Ensure required fields
  if (!newPackage.packageCode) {
    newPackage.packageCode = `PKG${String(newPackage.id).padStart(6, '0')}`;
  }
  if (!newPackage.packageName) {
    newPackage.packageName = `案件包${newPackage.id}`;
  }
  
  database.casePackages.push(newPackage);
  saveDatabase();
  
  console.log('✅ Case package created:', {
    id: newPackage.id,
    packageCode: newPackage.packageCode,
    packageName: newPackage.packageName,
    caseCount: newPackage.caseCount,
    totalAmount: newPackage.totalAmount
  });
  
  res.json({
    code: 200,
    message: 'Success',
    data: newPackage
  });
});

// Get case packages list with pagination
app.get('/api/case-packages', (req, res) => {
  console.log('=== Fetching case packages ===');
  
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortDir = req.query.sortDir || 'desc';
  
  // Sort packages
  let sortedPackages = [...database.casePackages];
  sortedPackages.sort((a, b) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    return sortDir === 'desc' ? 
      (bVal > aVal ? 1 : -1) : 
      (aVal > bVal ? 1 : -1);
  });
  
  // Paginate
  const start = page * size;
  const end = start + size;
  const paginatedPackages = sortedPackages.slice(start, end);
  
  console.log(`   - Total: ${database.casePackages.length}`);
  console.log(`   - Page: ${page}, Size: ${size}`);
  console.log(`   - Returning: ${paginatedPackages.length} items`);
  
  res.json({
    code: 200,
    message: 'Success',
    data: {
      content: paginatedPackages,
      totalElements: database.casePackages.length,
      totalPages: Math.ceil(database.casePackages.length / size),
      number: page,
      size: size
    }
  });
});

// Get case package by ID
app.get('/api/case-packages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pkg = database.casePackages.find(p => p.id === id);
  
  console.log(`=== Fetching case package ID: ${id} ===`);
  
  if (pkg) {
    res.json({
      code: 200,
      message: 'Success',
      data: pkg
    });
  } else {
    res.status(404).json({
      code: 404,
      message: 'Case package not found'
    });
  }
});

// Update case package
app.put('/api/case-packages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = database.casePackages.findIndex(p => p.id === id);
  
  console.log(`=== Updating case package ID: ${id} ===`);
  
  if (index !== -1) {
    database.casePackages[index] = {
      ...database.casePackages[index],
      ...req.body,
      id: id,
      updatedAt: new Date().toISOString()
    };
    saveDatabase();
    
    res.json({
      code: 200,
      message: 'Success',
      data: database.casePackages[index]
    });
  } else {
    res.status(404).json({
      code: 404,
      message: 'Case package not found'
    });
  }
});

// Delete case package
app.delete('/api/case-packages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = database.casePackages.findIndex(p => p.id === id);
  
  console.log(`=== Deleting case package ID: ${id} ===`);
  
  if (index !== -1) {
    database.casePackages.splice(index, 1);
    saveDatabase();
    
    res.json({
      code: 200,
      message: 'Success'
    });
  } else {
    res.status(404).json({
      code: 404,
      message: 'Case package not found'
    });
  }
});

// Database statistics endpoint
app.get('/api/database/stats', (req, res) => {
  const stats = {
    totalPackages: database.casePackages.length,
    totalCases: database.casePackages.reduce((sum, pkg) => sum + (pkg.caseCount || 0), 0),
    totalAmount: database.casePackages.reduce((sum, pkg) => sum + (pkg.totalAmount || 0), 0),
    databaseFile: DB_FILE,
    lastSaved: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).mtime : null
  };
  
  res.json({
    code: 200,
    message: 'Success',
    data: stats
  });
});

// Clear database (for testing)
app.delete('/api/database/clear', (req, res) => {
  console.log('⚠️  Clearing database...');
  database = {
    casePackages: [],
    nextId: 1
  };
  saveDatabase();
  
  res.json({
    code: 200,
    message: 'Database cleared'
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('============================================');
  console.log('🚀 Mock Server with Persistent Storage');
  console.log('============================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Database file: ${DB_FILE}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST   /api/case-packages       - Create case package');
  console.log('  GET    /api/case-packages       - List case packages (with pagination)');
  console.log('  GET    /api/case-packages/:id   - Get case package by ID');
  console.log('  PUT    /api/case-packages/:id   - Update case package');
  console.log('  DELETE /api/case-packages/:id   - Delete case package');
  console.log('  GET    /api/database/stats      - Database statistics');
  console.log('  DELETE /api/database/clear      - Clear database (testing only)');
  console.log('============================================');
});