require('dotenv').config();
const Admin = require('../models/Admin');
const AdminAttendance = require('../models/AdminAttendance');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
  upload.single('livePicture')(req, res, (err) => {
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

// AWS Face Recognition Integration for Admin Management
const { enhancedFaceComparison, validateImageForFaceRecognition, cleanupTempImage } = require('../utils/imageUtils');

// Face verification function for admin live pictures
async function verifyAdminLivePicture(livePicturePath) {
  try {
    console.log('🔍 Validating admin live picture for face recognition...');
    
    // Validate image quality for face recognition
    const imageValidation = validateImageForFaceRecognition(livePicturePath);
    if (!imageValidation.valid) {
      console.log('❌ Image validation failed:', imageValidation.message);
      return {
        success: false,
        message: imageValidation.message,
        error: imageValidation.error
      };
    }
    
    // Detect faces in the uploaded image
    const { detectFaces } = require('../config/aws');
    const imageBuffer = require('fs').readFileSync(livePicturePath);
    const faceDetection = await detectFaces(imageBuffer);
    
    if (!faceDetection.success) {
      console.log('❌ No faces detected in admin image');
      return {
        success: false,
        message: 'No faces detected in the uploaded image. Please ensure a clear face image is provided.',
        error: 'NO_FACE_DETECTED'
      };
    }
    
    if (faceDetection.faceCount > 1) {
      console.log('❌ Multiple faces detected in admin image');
      return {
        success: false,
        message: 'Multiple faces detected in the image. Please use an image with only one face.',
        error: 'MULTIPLE_FACES'
      };
    }
    
    console.log('✅ Admin live picture validation successful!');
    return {
      success: true,
      message: 'Live picture validation passed',
      faceCount: faceDetection.faceCount
    };
    
  } catch (error) {
    console.error('❌ Admin live picture validation error:', error);
    return {
      success: false,
      message: 'Live picture validation failed',
      error: error.message
    };
  }
}

// Face verification function for admin attendance using AWS Rekognition
async function verifyAdminFace(storedImageUrl, attendanceImagePath) {
  try {
    console.log('🔍 Starting admin face verification for attendance...');
    
    // Validate attendance image quality
    const imageValidation = validateImageForFaceRecognition(attendanceImagePath);
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
      storedImageUrl, // Stored admin image
      attendanceImagePath // Current attendance image
    );
    
    if (faceComparison.success && faceComparison.isMatch) {
      console.log(`✅ Admin face verification successful! Similarity: ${faceComparison.similarity}%, Confidence: ${faceComparison.confidence}`);
      return {
        success: true,
        similarity: faceComparison.similarity,
        message: faceComparison.message
      };
    } else {
      console.log(`❌ Admin face verification failed. Similarity: ${faceComparison.similarity}%`);
      return {
        success: false,
        similarity: faceComparison.similarity,
        message: faceComparison.message,
        error: faceComparison.error
      };
    }
    
  } catch (error) {
    console.error('❌ Admin face verification error:', error);
    return {
      success: false,
      similarity: 0,
      message: 'Face verification process failed',
      error: error.message
    };
  }
}

// Add Admin
exports.addAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    
    // Check if admin already exists with same email or phone
    const existingAdmin = await Admin.findOne({
      $or: [
        { email: email },
        { phoneNumber: phoneNumber }
      ]
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: 'Admin already exists with this email or phone number'
      });
    }

    let livePictureUrl = '';
    if (req.file) {
      // Validate live picture using AWS face recognition
      const faceValidation = await verifyAdminLivePicture(req.file.path);
      if (!faceValidation.success) {
        // Clean up temporary file
        cleanupTempImage(req.file.path);
        
        return res.status(400).json({
          message: faceValidation.message,
          error: faceValidation.error
        });
      }
      
      console.log('✅ Live picture validation passed, uploading to Cloudinary...');
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'salon-admins',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      });
      livePictureUrl = result.secure_url;
      
      // Clean up temporary file after successful upload
      cleanupTempImage(req.file.path);
    }

    const admin = new Admin({
      name,
      email,
      phoneNumber,
      livePicture: livePictureUrl
    });

    await admin.save();
    res.status(201).json({ 
      message: 'Admin added successfully', 
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber
      }
    });
  } catch (err) {
    console.error('Add Admin Error:', err);
    res.status(400).json({ 
      message: 'Add admin error', 
      error: err.message 
    });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (err) {
    console.error('Get All Admins Error:', err);
    res.status(500).json({ 
      message: 'Error fetching admins', 
      error: err.message 
    });
  }
};

// Admin Attendance Check-In/Check-Out
exports.adminAttendance = async (req, res) => {
  try {
    const { adminId, attendanceType } = req.body;

    if (!adminId || !attendanceType) {
      return res.status(400).json({
        message: 'Admin ID and attendance type are required'
      });
    }

    if (!['checkin', 'checkout'].includes(attendanceType)) {
      return res.status(400).json({
        message: 'Attendance type must be either checkin or checkout'
      });
    }

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    // Handle optional image upload for admin
    let attendanceImageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'admin-attendance',
        resource_type: 'auto'
      });
      attendanceImageUrl = result.secure_url;
      
      // Delete local file
      fs.unlinkSync(req.file.path);
    }

    // Check if attendance already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendance = await AdminAttendance.findOne({
      adminId: adminId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Validate attendance logic
    if (attendanceType === 'checkin') {
      if (attendance && attendance.checkInTime) {
        return res.status(400).json({
          message: 'Check-in already recorded for today'
        });
      }
    } else if (attendanceType === 'checkout') {
      if (!attendance || !attendance.checkInTime) {
        return res.status(400).json({
          message: 'No check-in record found for today'
        });
      }
      if (attendance.checkOutTime) {
        return res.status(400).json({
          message: 'Check-out already recorded for today'
        });
      }
    }

    // Create or update attendance
    if (!attendance) {
      attendance = new AdminAttendance({
        adminId: adminId,
        adminName: admin.name,
        adminEmail: admin.email,
        date: today,
        status: 'present',
        attendanceType: attendanceType
      });
    }

    // Update based on attendance type
    if (attendanceType === 'checkin') {
      attendance.checkInTime = new Date();
      if (attendanceImageUrl) {
        attendance.checkInImage = attendanceImageUrl;
      }
      attendance.status = 'present';
    } else if (attendanceType === 'checkout') {
      attendance.checkOutTime = new Date();
      if (attendanceImageUrl) {
        attendance.checkOutImage = attendanceImageUrl;
      }
    }

    attendance.updatedAt = new Date();
    await attendance.save();

    res.status(200).json({
      message: `${attendanceType === 'checkin' ? 'Check-in' : 'Check-out'} successful`,
      attendance: {
        id: attendance._id,
        adminName: attendance.adminName,
        adminEmail: attendance.adminEmail,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status,
        attendanceType: attendanceType
      }
    });
  } catch (err) {
    console.error('Admin Attendance Error:', err);
    res.status(500).json({
      message: 'Error during admin attendance',
      error: err.message
    });
  }
};

// Get All Admin Attendance Records
exports.getAllAdminAttendance = async (req, res) => {
  try {
    const { date, adminId, status } = req.query;
    
    let filter = {};
    
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      filter.date = {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    if (adminId) {
      filter.adminId = adminId;
    }
    
    if (status) {
      filter.status = status;
    }

    const attendanceRecords = await AdminAttendance.find(filter)
      .populate('adminId', 'name adminId email')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json(attendanceRecords);
  } catch (err) {
    console.error('Get All Admin Attendance Records Error:', err);
    res.status(500).json({
      message: 'Error fetching admin attendance records',
      error: err.message
    });
  }
};

// Get Admin Attendance by ID
exports.getAdminAttendanceById = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const attendanceRecords = await AdminAttendance.find({ adminId })
      .populate('adminId', 'name adminId email')
      .sort({ date: -1 });

    if (!attendanceRecords.length) {
      return res.status(404).json({ 
        message: 'No attendance records found for this admin' 
      });
    }
    
    res.status(200).json(attendanceRecords);
  } catch (err) {
    console.error('Get Admin Attendance Error:', err);
    res.status(500).json({ 
      message: 'Error fetching admin attendance', 
      error: err.message 
    });
  }
};

// Mark Absent Admins (Daily Task)
exports.markAbsentAdmins = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all admins
    const admins = await Admin.find();

    // Get today's attendance records
    const todayAttendance = await AdminAttendance.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const presentAdminIds = todayAttendance.map(att => att.adminId.toString());

    // Mark absent admins
    const absentAdmins = [];
    for (const admin of admins) {
      if (!presentAdminIds.includes(admin._id.toString())) {
        // Check if attendance record already exists
        let attendance = await AdminAttendance.findOne({
          adminId: admin._id,
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        });

        if (!attendance) {
          attendance = new AdminAttendance({
            adminId: admin._id,
            adminName: admin.name,
            adminEmail: admin.email,
            date: today,
            status: 'absent'
          });
          await attendance.save();
        }

        absentAdmins.push({
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email
        });
      }
    }

    res.status(200).json({
      message: 'Absent admins marked successfully',
      absentCount: absentAdmins.length,
      absentAdmins
    });
  } catch (err) {
    console.error('Mark Absent Admins Error:', err);
    res.status(500).json({
      message: 'Error marking absent admins',
      error: err.message
    });
  }
};

exports.handleFileUpload = handleFileUpload; 