const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const pdfService = require('../services/pdfService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { year, month } = req.params;
    const uploadDir = path.join(process.env.UPLOAD_PATH || './uploads', `${year}-${month}`);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  }
});

// File filter to only allow PDF and images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Helper to get metadata file path
const getMetadataPath = (year, month) => {
  return path.join(process.env.UPLOAD_PATH || './uploads', `${year}-${month}`, 'metadata.json');
};

// Helper to load metadata
const loadMetadata = (year, month) => {
  const metadataPath = getMetadataPath(year, month);
  if (fs.existsSync(metadataPath)) {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }
  return { files: [] };
};

// Helper to save metadata
const saveMetadata = (year, month, metadata) => {
  const metadataPath = getMetadataPath(year, month);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};

// GET /api/files/:year/:month
router.get('/:year/:month', authMiddleware, (req, res) => {
  try {
    const { year, month } = req.params;
    const metadata = loadMetadata(year, month);
    
    // Add URL to each file
    const filesWithUrls = metadata.files.map(file => ({
      ...file,
      url: `/api/files/preview/${year}/${month}/${file.storedName}`
    }));
    
    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// POST /api/files/upload/:year/:month
router.post('/upload/:year/:month', authMiddleware, upload.array('files', 10), (req, res) => {
  try {
    const { year, month } = req.params;
    const uploadedBy = req.user.username;
    const customNames = req.body.names ? JSON.parse(req.body.names) : {};
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const metadata = loadMetadata(year, month);
    const uploadedFiles = [];
    
    // Find the maximum existing order value
    const maxOrder = metadata.files.reduce((max, file) => {
      return file.order !== undefined ? Math.max(max, file.order) : max;
    }, -1);
    
    req.files.forEach((file, index) => {
      const fileData = {
        id: uuidv4(),
        originalName: file.originalname,
        storedName: file.filename,
        name: customNames[index] || file.originalname,
        type: file.mimetype,
        size: file.size,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
        order: maxOrder + index + 1 // Assign order at the end
      };
      
      metadata.files.push(fileData);
      uploadedFiles.push({
        ...fileData,
        url: `/api/files/preview/${year}/${month}/${file.filename}`
      });
    });
    
    saveMetadata(year, month, metadata);
    
    res.status(201).json(uploadedFiles);
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// POST /api/files/reorder/:year/:month
router.post('/reorder/:year/:month', authMiddleware, (req, res) => {
  try {
    const { year, month } = req.params;
    const { order } = req.body;
    
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be an array' });
    }
    
    const metadata = loadMetadata(year, month);
    
    // Update order for each file
    order.forEach(({ id, order: orderValue }) => {
      const file = metadata.files.find(f => f.id === id);
      if (file) {
        file.order = orderValue;
      }
    });
    
    saveMetadata(year, month, metadata);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering files:', error);
    res.status(500).json({ error: 'Failed to reorder files' });
  }
});

// DELETE /api/files/:year/:month/:filename
router.delete('/:year/:month/:filename', authMiddleware, (req, res) => {
  try {
    const { year, month, filename } = req.params;
    const metadata = loadMetadata(year, month);
    
    const fileIndex = metadata.files.findIndex(f => f.storedName === filename);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = metadata.files[fileIndex];
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', `${year}-${month}`, file.storedName);
    
    // Delete file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from metadata
    metadata.files.splice(fileIndex, 1);
    saveMetadata(year, month, metadata);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// GET /api/files/preview/:year/:month/:filename
router.get('/preview/:year/:month/:filename', authMiddleware, (req, res) => {
  try {
    const { year, month, filename } = req.params;
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', `${year}-${month}`, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error previewing file:', error);
    res.status(500).json({ error: 'Failed to preview file' });
  }
});

// POST /api/files/generate-pdf/:year/:month
router.post('/generate-pdf/:year/:month', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { sortBy = 'custom' } = req.body;
    
    const metadata = loadMetadata(year, month);
    
    if (metadata.files.length === 0) {
      return res.status(400).json({ error: 'No files to generate PDF' });
    }
    
    // Sort files
    const sortedFiles = [...metadata.files].sort((a, b) => {
      if (sortBy === 'custom' || sortBy === 'order') {
        // Use custom order if available, fallback to uploadedAt
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'type') {
        return a.type.localeCompare(b.type);
      }
      return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    });
    
    // Generate PDF
    const pdfBuffer = await pdfService.generateCombinedPDF(sortedFiles, year, month);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comprobantes-${year}-${month}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
