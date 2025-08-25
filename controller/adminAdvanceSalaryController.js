require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AdvanceSalary = require('../models/AdvanceSalary');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const handleFileUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({
        message: 'File upload error',
        error: err.message,
      });
    }
    console.log('📋 Parsed body:', req.body);
    console.log('📁 File:', req.file);
    next();
  });
};

// Add Advance Salary (Only amount and image)
exports.addAdminAdvanceSalary = async (req, res) => {
  try {
    const { amount } = req.body || {};

    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({
        message: 'Amount is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Image is required'
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'admin-advance-salary',
      resource_type: 'auto'
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    const advanceSalary = new AdvanceSalary({
      amount: parseFloat(amount),
      image: result.secure_url
    });

    await advanceSalary.save();

    res.status(201).json({
      message: 'Advance salary added successfully',
      advanceSalary: {
        id: advanceSalary._id,
        amount: advanceSalary.amount,
        image: advanceSalary.image,
        createdAt: advanceSalary.createdAt
      }
    });
  } catch (err) {
    console.error('Add Admin Advance Salary Error:', err);
    res.status(500).json({
      message: 'Error adding advance salary',
      error: err.message
    });
  }
};

// Get All Admin Advance Salary Records
exports.getAllAdminAdvanceSalary = async (req, res) => {
  try {
    const advanceSalaryRecords = await AdvanceSalary.find({}, 'amount image createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(advanceSalaryRecords);
  } catch (err) {
    console.error('Get All Admin Advance Salary Error:', err);
    res.status(500).json({
      message: 'Error fetching admin advance salary records',
      error: err.message
    });
  }
};

// Get Admin Advance Salary Statistics
exports.getAdminAdvanceSalaryStats = async (req, res) => {
  try {
    const totalRecords = await AdvanceSalary.countDocuments({});

    const amounts = await AdvanceSalary.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);

    const totalAmount = amounts.length > 0 ? amounts[0].totalAmount : 0;

    res.status(200).json({
      totalRecords,
      totalAmount
    });
  } catch (err) {
    console.error('Get Admin Advance Salary Stats Error:', err);
    res.status(500).json({
      message: 'Error fetching admin advance salary statistics',
      error: err.message
    });
  }
};

// Get Admin Advance Salary by ID
exports.getAdminAdvanceSalaryById = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const advanceSalary = await AdvanceSalary.findById(recordId).select('amount image createdAt');

    if (!advanceSalary) {
      return res.status(404).json({ 
        message: 'Advance salary record not found' 
      });
    }
    
    res.status(200).json(advanceSalary);
  } catch (err) {
    console.error('Get Admin Advance Salary by ID Error:', err);
    res.status(500).json({ 
      message: 'Error fetching advance salary record', 
      error: err.message 
    });
  }
};

exports.handleFileUpload = handleFileUpload; 