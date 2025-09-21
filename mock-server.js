const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mock data
let casePackages = [
  {
    id: 1,
    name: '2024年第一季度消费贷案件包',
    sourceOrgName: '中国银行',
    totalCases: 150,
    totalAmount: 5000000,
    status: 'PUBLISHED',
    publishTime: '2024-01-15T10:00:00',
    bidDeadline: '2024-02-15T10:00:00',
    description: '包含150个消费贷逾期案件'
  },
  {
    id: 2,
    name: '2024年信用卡逾期案件包',
    sourceOrgName: '招商银行',
    totalCases: 200,
    totalAmount: 8000000,
    status: 'BIDDING',
    publishTime: '2024-01-20T10:00:00',
    bidDeadline: '2024-02-20T10:00:00',
    description: '包含200个信用卡逾期案件'
  }
];

// Routes
app.get('/api/v1/case-packages', (req, res) => {
  const { page = 0, size = 10 } = req.query;
  const start = page * size;
  const end = start + parseInt(size);

  res.json({
    code: 200,
    message: 'success',
    data: {
      content: casePackages.slice(start, end),
      totalElements: casePackages.length,
      totalPages: Math.ceil(casePackages.length / size),
      number: page
    }
  });
});

app.get('/api/v1/case-packages/:id', (req, res) => {
  const pkg = casePackages.find(p => p.id == req.params.id);
  if (pkg) {
    res.json({
      code: 200,
      message: 'success',
      data: pkg
    });
  } else {
    res.status(404).json({
      code: 404,
      message: 'Case package not found'
    });
  }
});

app.post('/api/v1/case-packages', (req, res) => {
  const newPackage = {
    id: casePackages.length + 1,
    ...req.body,
    status: 'DRAFT',
    publishTime: new Date().toISOString()
  };
  casePackages.push(newPackage);

  res.json({
    code: 200,
    message: 'Case package created successfully',
    data: newPackage
  });
});

app.put('/api/v1/case-packages/:id', (req, res) => {
  const index = casePackages.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    casePackages[index] = { ...casePackages[index], ...req.body };
    res.json({
      code: 200,
      message: 'Case package updated successfully',
      data: casePackages[index]
    });
  } else {
    res.status(404).json({
      code: 404,
      message: 'Case package not found'
    });
  }
});

app.delete('/api/v1/case-packages/:id', (req, res) => {
  const index = casePackages.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    casePackages.splice(index, 1);
    res.json({
      code: 200,
      message: 'Case package deleted successfully'
    });
  } else {
    res.status(404).json({
      code: 404,
      message: 'Case package not found'
    });
  }
});

// File upload endpoint
app.post('/api/v1/case-packages/:id/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: 'No file uploaded'
    });
  }

  console.log('File uploaded:', req.file.originalname, 'Size:', req.file.size);

  res.json({
    code: 200,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.originalname,
      size: req.file.size,
      uploadTime: new Date().toISOString()
    }
  });
});

// Batch import endpoint
app.post('/api/v1/case-packages/:id/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: 'No file uploaded'
    });
  }

  console.log('Import file:', req.file.originalname);

  // Simulate processing
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'Cases imported successfully',
      data: {
        totalRows: 100,
        successCount: 95,
        failureCount: 5,
        errors: [
          { row: 10, message: 'Invalid ID card format' },
          { row: 25, message: 'Missing loan amount' }
        ]
      }
    });
  }, 1000);
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log(`API endpoints:`);
  console.log(`  GET    http://localhost:${port}/api/v1/case-packages`);
  console.log(`  POST   http://localhost:${port}/api/v1/case-packages`);
  console.log(`  PUT    http://localhost:${port}/api/v1/case-packages/:id`);
  console.log(`  DELETE http://localhost:${port}/api/v1/case-packages/:id`);
  console.log(`  POST   http://localhost:${port}/api/v1/case-packages/:id/upload`);
  console.log(`  POST   http://localhost:${port}/api/v1/case-packages/:id/import`);
});