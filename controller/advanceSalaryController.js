require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AdvanceSalary = require('../models/AdvanceSalary');
const Employee = require('../models/Employee');

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

// AWS Face Recognition Integration for Advance Salary
const { enhancedFaceComparison, validateImageForFaceRecognition, cleanupTempImage } = require('../utils/imageUtils');

const handleFileUpload = (req, res, next) => {
  upload.fields([
    { name: 'employeeLivePicture', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({
        message: 'File upload error',
        error: err.message,
      });
    }
    console.log('📋 Parsed body:', req.body);
    console.log('📁 Files:', req.files);
    next();
  });
};

// Face verification function for advance salary requests
async function verifyEmployeeFaceForAdvanceSalary(storedImageUrl, livePicturePath) {
  try {
    console.log('🔍 Starting employee face verification for advance salary...');
    
    // Validate live picture quality
    const imageValidation = validateImageForFaceRecognition(livePicturePath);
    if (!imageValidation.valid) {
      console.log('❌ Image validation failed:', imageValidation.message);
      return {
        success: false,
        message: imageValidation.message,
        error: imageValidation.error
      };
    }
    
    // Perform enhanced face comparison
    const faceComparison = await enhancedFaceComparison(
      storedImageUrl, // Stored employee image
      livePicturePath // Current live picture
    );
    
    if (faceComparison.success && faceComparison.isMatch) {
      console.log(`✅ Employee face verification successful! Similarity: ${faceComparison.similarity}%, Confidence: ${faceComparison.confidence}`);
      return {
        success: true,
        similarity: faceComparison.similarity,
        message: faceComparison.message
      };
    } else {
      console.log(`❌ Employee face verification failed. Similarity: ${faceComparison.similarity}%`);
      return {
        success: false,
        similarity: faceComparison.similarity,
        message: faceComparison.message,
        error: faceComparison.error
      };
    }
    
  } catch (error) {
    console.error('❌ Employee face verification error:', error);
    return {
      success: false,
      similarity: 0,
      message: 'Face verification process failed',
      error: error.message
    };
  }
}

// Add Advance Salary Request (Manager)
exports.addAdvanceSalaryRequest = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body is missing',
      });
    }

    const { employeeId, amount } = req.body;

    if (!employeeId || !amount) {
      return res.status(400).json({
        message: 'Fields required: employeeId, amount'
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Check if required files are uploaded
    if (!req.files || !req.files.employeeLivePicture || !req.files.image) {
      return res.status(400).json({
        message: 'Both employee live picture and additional image are required'
      });
    }

    // Verify employee face using AWS Rekognition
    const faceVerification = await verifyEmployeeFaceForAdvanceSalary(
      employee.livePicture, // Stored employee image
      req.files.employeeLivePicture[0].path // Current live picture
    );
    
    if (!faceVerification.success) {
      // Clean up temporary files
      cleanupTempImage(req.files.employeeLivePicture[0].path);
      cleanupTempImage(req.files.image[0].path);
      
      return res.status(400).json({
        message: faceVerification.message,
        similarity: faceVerification.similarity,
        error: faceVerification.error
      });
    }
    
    console.log(`✅ Face verification successful! Similarity: ${faceVerification.similarity}%`);
    
    // Upload additional image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(
      req.files.image[0].path,
      {
        folder: 'advance-salary-proof',
        resource_type: 'auto'
      }
    );

    // Clean up temporary files after successful upload
    cleanupTempImage(req.files.employeeLivePicture[0].path);
    cleanupTempImage(req.files.image[0].path);

    const advanceSalary = new AdvanceSalary({
      amount: parseFloat(amount),
      image: imageResult.secure_url
    });

    await advanceSalary.save();

    res.status(201).json({
      message: 'Advance salary request submitted successfully',
      advanceSalary: {
        id: advanceSalary._id,
        amount: advanceSalary.amount,
        image: advanceSalary.image
      }
    });
  } catch (err) {
    console.error('Add Advance Salary Error:', err);
    res.status(500).json({
      message: 'Error adding advance salary request',
      error: err.message
    });
  }
};

// Get All Advance Salary Requests (with filters)
exports.getAllAdvanceSalaryRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const advanceSalaryRequests = await AdvanceSalary.find(filter)
      .sort({ createdAt: -1 })
      .select('amount image');

    res.status(200).json(advanceSalaryRequests);
  } catch (err) {
    console.error('Get All Advance Salary Requests Error:', err);
    res.status(500).json({
      message: 'Error fetching advance salary requests',
      error: err.message
    });
  }
};

// Get Pending Advance Salary Requests (Admin)
exports.getPendingAdvanceSalaryRequests = async (req, res) => {
  try {
    const pendingRequests = await AdvanceSalary.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .select('amount image');

    res.status(200).json(pendingRequests);
  } catch (err) {
    console.error('Get Pending Advance Salary Requests Error:', err);
    res.status(500).json({
      message: 'Error fetching pending advance salary requests',
      error: err.message
    });
  }
};

// Approve/Decline Advance Salary Request (Admin)
exports.approveDeclineAdvanceSalary = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either approved or declined'
      });
    }

    const advanceSalary = await AdvanceSalary.findById(requestId);
    if (!advanceSalary) {
      return res.status(404).json({ 
        message: 'Advance salary request not found' 
      });
    }

    if (advanceSalary.status !== 'pending') {
      return res.status(400).json({
        message: 'This request has already been processed'
      });
    }

    advanceSalary.status = status;
    advanceSalary.updatedAt = new Date();

    await advanceSalary.save();

    res.status(200).json({
      message: `Advance salary request ${status} successfully`,
      advanceSalary: {
        id: advanceSalary._id,
        amount: advanceSalary.amount,
        image: advanceSalary.image
      }
    });
  } catch (err) {
    console.error('Approve/Decline Advance Salary Error:', err);
    res.status(500).json({
      message: 'Error processing advance salary request',
      error: err.message
    });
  }
};

// Get Advance Salary Request by ID
exports.getAdvanceSalaryById = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const advanceSalary = await AdvanceSalary.findById(requestId)
      .select('amount image');

    if (!advanceSalary) {
      return res.status(404).json({ 
        message: 'Advance salary request not found' 
      });
    }
    
    res.status(200).json(advanceSalary);
  } catch (err) {
    console.error('Get Advance Salary by ID Error:', err);
    res.status(500).json({ 
      message: 'Error fetching advance salary request', 
      error: err.message 
    });
  }
};

// Get Advance Salary Statistics
exports.getAdvanceSalaryStats = async (req, res) => {
  try {
    const totalRequests = await AdvanceSalary.countDocuments();
    const pendingRequests = await AdvanceSalary.countDocuments({ status: 'pending' });
    const approvedRequests = await AdvanceSalary.countDocuments({ status: 'approved' });
    const declinedRequests = await AdvanceSalary.countDocuments({ status: 'declined' });

    // Calculate total approved amount
    const approvedAmounts = await AdvanceSalary.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);

    const totalApprovedAmount = approvedAmounts.length > 0 ? approvedAmounts[0].totalAmount : 0;

    res.status(200).json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      declinedRequests,
      totalApprovedAmount
    });
  } catch (err) {
    console.error('Get Advance Salary Stats Error:', err);
    res.status(500).json({
      message: 'Error fetching advance salary statistics',
      error: err.message
    });
  }
};

exports.handleFileUpload = handleFileUpload; 