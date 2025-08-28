<<<<<<< HEAD
require('dotenv').config();
const Employee = require('../models/Employee');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
=======
require("dotenv").config();
const Employee = require("../models/Employee");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
>>>>>>> master
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
<<<<<<< HEAD
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
=======
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
>>>>>>> master
  },
});
const upload = multer({ storage: storage }).any();

// AWS Face Recognition Integration for Employee Management
<<<<<<< HEAD
const { enhancedFaceComparison, validateImageForFaceRecognition, cleanupTempImage } = require('../utils/imageUtils');
=======
const {
  enhancedFaceComparison,
  validateImageForFaceRecognition,
  cleanupTempImage,
} = require("../utils/imageUtils");
>>>>>>> master

const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
<<<<<<< HEAD
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
=======
      console.error("Multer Error:", err);
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
>>>>>>> master
    }
    next();
  });
};

// Face verification function for employee live pictures
async function verifyEmployeeLivePicture(livePicturePath) {
  try {
<<<<<<< HEAD
    console.log('🔍 Validating employee live picture for face recognition...');
    
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
      console.log('❌ No faces detected in employee image');
      return {
        success: false,
        message: 'No faces detected in the uploaded image. Please ensure a clear face image is provided.',
        error: 'NO_FACE_DETECTED'
      };
    }
    
    if (faceDetection.faceCount > 1) {
      console.log('❌ Multiple faces detected in employee image');
      return {
        success: false,
        message: 'Multiple faces detected in the image. Please use an image with only one face.',
        error: 'MULTIPLE_FACES'
      };
    }
    
    console.log('✅ Employee live picture validation successful!');
    return {
      success: true,
      message: 'Live picture validation passed',
      faceCount: faceDetection.faceCount
    };
    
  } catch (error) {
    console.error('❌ Employee live picture validation error:', error);
    return {
      success: false,
      message: 'Live picture validation failed',
      error: error.message
=======
    console.log("🔍 Validating employee live picture for face recognition...");

    // Validate image quality for face recognition
    const imageValidation = validateImageForFaceRecognition(livePicturePath);
    if (!imageValidation.valid) {
      console.log("❌ Image validation failed:", imageValidation.message);
      return {
        success: false,
        message: imageValidation.message,
        error: imageValidation.error,
      };
    }

    // Detect faces in the uploaded image
    const { detectFaces } = require("../config/aws");
    const imageBuffer = require("fs").readFileSync(livePicturePath);
    const faceDetection = await detectFaces(imageBuffer);

    if (!faceDetection.success) {
      console.log("❌ No faces detected in employee image");
      return {
        success: false,
        message:
          "No faces detected in the uploaded image. Please ensure a clear face image is provided.",
        error: "NO_FACE_DETECTED",
      };
    }

    if (faceDetection.faceCount > 1) {
      console.log("❌ Multiple faces detected in employee image");
      return {
        success: false,
        message:
          "Multiple faces detected in the image. Please use an image with only one face.",
        error: "MULTIPLE_FACES",
      };
    }

    console.log("✅ Employee live picture validation successful!");
    return {
      success: true,
      message: "Live picture validation passed",
      faceCount: faceDetection.faceCount,
    };
  } catch (error) {
    console.error("❌ Employee live picture validation error:", error);
    return {
      success: false,
      message: "Live picture validation failed",
      error: error.message,
>>>>>>> master
    };
  }
}

// Add Employee or Manager
exports.addEmployee = async (req, res) => {
  try {
    const { name, phoneNumber, idCardNumber, monthlySalary, role } = req.body;
<<<<<<< HEAD
    
    // Validate role
    if (role && !['employee', 'manager'].includes(role)) {
      return res.status(400).json({
        message: 'Role must be either "employee" or "manager"'
=======

    // Validate role
    if (role && !["employee", "manager"].includes(role)) {
      return res.status(400).json({
        message: 'Role must be either "employee" or "manager"',
>>>>>>> master
      });
    }

    // Check if employee already exists with same phone or ID card
    const existingEmployee = await Employee.findOne({
<<<<<<< HEAD
      $or: [
        { phoneNumber: phoneNumber },
        { idCardNumber: idCardNumber }
      ]
=======
      $or: [{ phoneNumber: phoneNumber }, { idCardNumber: idCardNumber }],
>>>>>>> master
    });

    if (existingEmployee) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Employee already exists with this phone number or ID card number'
      });
    }

    let livePictureUrl = '';
    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === 'livePicture');
=======
        message:
          "Employee already exists with this phone number or ID card number",
      });
    }

    let livePictureUrl = "";
    if (req.files && req.files.length > 0) {
      const file = req.files.find((f) => f.fieldname === "livePicture");
>>>>>>> master
      if (file) {
        // Validate live picture using AWS face recognition
        const faceValidation = await verifyEmployeeLivePicture(file.path);
        if (!faceValidation.success) {
          // Clean up temporary file
          cleanupTempImage(file.path);
<<<<<<< HEAD
          
          return res.status(400).json({
            message: faceValidation.message,
            error: faceValidation.error
          });
        }
        
        console.log('✅ Live picture validation passed, uploading to Cloudinary...');
        
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'salon-employees',
          resource_type: 'auto',
=======

          return res.status(400).json({
            message: faceValidation.message,
            error: faceValidation.error,
          });
        }

        console.log(
          "✅ Live picture validation passed, uploading to Cloudinary..."
        );

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "salon-employees",
          resource_type: "auto",
>>>>>>> master
          use_filename: true,
          unique_filename: true,
        });
        livePictureUrl = result.secure_url;
<<<<<<< HEAD
        
=======

>>>>>>> master
        // Clean up temporary file after successful upload
        cleanupTempImage(file.path);
      }
    }

    if (!livePictureUrl) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Live picture is required for attendance matching'
=======
        message: "Live picture is required for attendance matching",
>>>>>>> master
      });
    }

    const employee = new Employee({
      name,
      phoneNumber,
      idCardNumber,
      monthlySalary,
<<<<<<< HEAD
      role: role || 'employee', // Default to employee if not specified
      livePicture: livePictureUrl   
    });

    await employee.save();
    
    const roleText = role === 'manager' ? 'Manager' : 'Employee';
    res.status(201).json({ 
      message: `${roleText} added successfully`, 
      employeeId: employee.employeeId,
      employee 
    });
  } catch (err) {
    console.error('Add Employee Error:', err);
    res.status(400).json({ 
      message: 'Add employee error', 
      error: err.message 
=======
      role: role || "employee", // Default to employee if not specified
      livePicture: livePictureUrl,
    });

    await employee.save();

    const roleText = role === "manager" ? "Manager" : "Employee";
    res.status(201).json({
      message: `${roleText} added successfully`,
      employeeId: employee.employeeId,
      employee,
    });
  } catch (err) {
    console.error("Add Employee Error:", err);
    res.status(400).json({
      message: "Add employee error",
      error: err.message,
>>>>>>> master
    });
  }
};

// Get All Employees (with role filter)
exports.getAllEmployees = async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};
<<<<<<< HEAD
    
    // Filter by role if specified
    if (role && ['employee', 'manager'].includes(role)) {
      filter.role = role;
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 }).select('employeeId name phoneNumber role createdAt');
    
    // Group employees by role for better organization
    const groupedEmployees = {
      managers: employees.filter(emp => emp.role === 'manager'),
      employees: employees.filter(emp => emp.role === 'employee'),
      all: employees
    };

    res.status(200).json({
      message: 'Employees retrieved successfully',
      data: groupedEmployees,
      total: employees.length,
      managers: groupedEmployees.managers.length,
      employees: groupedEmployees.employees.length
    });
  } catch (err) {
    console.error('Get All Employees Error:', err);
    res.status(500).json({ 
      message: 'Error fetching employees', 
      error: err.message 
=======

    // Filter by role if specified
    if (role && ["employee", "manager"].includes(role)) {
      filter.role = role;
    }

    const employees = await Employee.find(filter)
      .sort({ createdAt: -1 })
      .select("employeeId name phoneNumber role createdAt livePicture");

    if (!employees || employees.length === 0) {
      return res.status(200).json({
        message: "No employees found",
        data: [],
        total: 0,
        grouped: {
          managers: [],
          employees: [],
        },
      });
    }

    // Group employees by role (optional)
    const groupedEmployees = {
      managers: employees.filter((emp) => emp.role === "manager"),
      employees: employees.filter((emp) => emp.role === "employee"),
    };

    // ✅ Return both array + grouped
    res.status(200).json({
      message: "Employees retrieved successfully",
      data: employees, // simple array for frontend
      total: employees.length,
      grouped: groupedEmployees, // grouped version if needed
    });
  } catch (err) {
    console.error("Get All Employees Error:", err);
    res.status(500).json({
      message: "Error fetching employees",
      error: err.message,
>>>>>>> master
    });
  }
};

// Get Employees by Role
exports.getEmployeesByRole = async (req, res) => {
  try {
    const { role } = req.params;
<<<<<<< HEAD
    
    if (!['employee', 'manager'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be "employee" or "manager"'
      });
    }

    const employees = await Employee.find({ role }).sort({ createdAt: -1 }).select('employeeId name phoneNumber role createdAt');
    
    const roleText = role === 'manager' ? 'Managers' : 'Employees';
    res.status(200).json({
      message: `${roleText} retrieved successfully`,
      data: employees,
      total: employees.length
    });
  } catch (err) {
    console.error('Get Employees by Role Error:', err);
    res.status(500).json({ 
      message: 'Error fetching employees by role', 
      error: err.message 
=======

    if (!["employee", "manager"].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be "employee" or "manager"',
      });
    }

    const employees = await Employee.find({ role })
      .sort({ createdAt: -1 })
      .select("employeeId name phoneNumber role createdAt");

    const roleText = role === "manager" ? "Managers" : "Employees";
    res.status(200).json({
      message: `${roleText} retrieved successfully`,
      data: employees,
      total: employees.length,
    });
  } catch (err) {
    console.error("Get Employees by Role Error:", err);
    res.status(500).json({
      message: "Error fetching employees by role",
      error: err.message,
>>>>>>> master
    });
  }
};

// Get Employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const employee = await Employee.findById(id).select('employeeId name phoneNumber idCardNumber monthlySalary role livePicture createdAt');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json({
      message: 'Employee retrieved successfully',
      data: employee
    });
  } catch (err) {
    console.error('Get Employee Error:', err);
    res.status(500).json({ 
      message: 'Error fetching employee', 
      error: err.message 
=======
    const employee = await Employee.findById(id).select(
      "employeeId name phoneNumber idCardNumber monthlySalary role livePicture createdAt"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Employee retrieved successfully",
      data: employee,
    });
  } catch (err) {
    console.error("Get Employee Error:", err);
    res.status(500).json({
      message: "Error fetching employee",
      error: err.message,
>>>>>>> master
    });
  }
};

// Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, idCardNumber, monthlySalary, role } = req.body;
<<<<<<< HEAD
    
    // Validate role if provided
    if (role && !['employee', 'manager'].includes(role)) {
      return res.status(400).json({
        message: 'Role must be either "employee" or "manager"'
      });
    }
    
=======

    // Validate role if provided
    if (role && !["employee", "manager"].includes(role)) {
      return res.status(400).json({
        message: 'Role must be either "employee" or "manager"',
      });
    }

>>>>>>> master
    let update = { name, phoneNumber, idCardNumber, monthlySalary };
    if (role) {
      update.role = role;
    }
<<<<<<< HEAD
    
=======

>>>>>>> master
    // Check if phone number or ID card number already exists for other employees
    const existingEmployee = await Employee.findOne({
      $and: [
        { _id: { $ne: id } },
        {
<<<<<<< HEAD
          $or: [
            { phoneNumber: phoneNumber },
            { idCardNumber: idCardNumber }
          ]
        }
      ]
=======
          $or: [{ phoneNumber: phoneNumber }, { idCardNumber: idCardNumber }],
        },
      ],
>>>>>>> master
    });

    if (existingEmployee) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Phone number or ID card number already exists for another employee'
=======
        message:
          "Phone number or ID card number already exists for another employee",
>>>>>>> master
      });
    }

    // Handle live picture update
    if (req.files && req.files.length > 0) {
<<<<<<< HEAD
      const file = req.files.find(f => f.fieldname === 'livePicture');
=======
      const file = req.files.find((f) => f.fieldname === "livePicture");
>>>>>>> master
      if (file) {
        // Validate live picture using AWS face recognition
        const faceValidation = await verifyEmployeeLivePicture(file.path);
        if (!faceValidation.success) {
          // Clean up temporary file
          cleanupTempImage(file.path);
<<<<<<< HEAD
          
          return res.status(400).json({
            message: faceValidation.message,
            error: faceValidation.error
          });
        }
        
        console.log('✅ Live picture validation passed, uploading to Cloudinary...');
        
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'salon-employees',
          resource_type: 'auto',
=======

          return res.status(400).json({
            message: faceValidation.message,
            error: faceValidation.error,
          });
        }

        console.log(
          "✅ Live picture validation passed, uploading to Cloudinary..."
        );

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "salon-employees",
          resource_type: "auto",
>>>>>>> master
          use_filename: true,
          unique_filename: true,
        });
        update.livePicture = result.secure_url;
<<<<<<< HEAD
        
=======

>>>>>>> master
        // Clean up temporary file after successful upload
        cleanupTempImage(file.path);
      }
    }

<<<<<<< HEAD
    const employee = await Employee.findByIdAndUpdate(id, update, { new: true }).select('employeeId name phoneNumber idCardNumber monthlySalary role livePicture createdAt');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const roleText = employee.role === 'manager' ? 'Manager' : 'Employee';
    res.status(200).json({ 
      message: `${roleText} updated successfully`, 
      data: employee 
    });
  } catch (err) {
    console.error('Update Employee Error:', err);
    res.status(400).json({ 
      message: 'Update employee error', 
      error: err.message 
=======
    const employee = await Employee.findByIdAndUpdate(id, update, {
      new: true,
    }).select(
      "employeeId name phoneNumber idCardNumber monthlySalary role livePicture createdAt"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const roleText = employee.role === "manager" ? "Manager" : "Employee";
    res.status(200).json({
      message: `${roleText} updated successfully`,
      data: employee,
    });
  } catch (err) {
    console.error("Update Employee Error:", err);
    res.status(400).json({
      message: "Update employee error",
      error: err.message,
>>>>>>> master
    });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const employee = await Employee.findByIdAndDelete(id).select('employeeId name phoneNumber role');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const roleText = employee.role === 'manager' ? 'Manager' : 'Employee';
    res.status(200).json({ 
      message: `${roleText} deleted successfully`,
      data: { deletedEmployee: employee }
    });
  } catch (err) {
    console.error('Delete Employee Error:', err);
    res.status(400).json({ 
      message: 'Delete employee error', 
      error: err.message 
=======
    const employee = await Employee.findByIdAndDelete(id).select(
      "employeeId name phoneNumber role"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const roleText = employee.role === "manager" ? "Manager" : "Employee";
    res.status(200).json({
      message: `${roleText} deleted successfully`,
      data: { deletedEmployee: employee },
    });
  } catch (err) {
    console.error("Delete Employee Error:", err);
    res.status(400).json({
      message: "Delete employee error",
      error: err.message,
>>>>>>> master
    });
  }
};

// Get Employee Statistics
exports.getEmployeeStats = async (req, res) => {
  try {
    const [totalEmployees, managers, employees] = await Promise.all([
      Employee.countDocuments(),
<<<<<<< HEAD
      Employee.countDocuments({ role: 'manager' }),
      Employee.countDocuments({ role: 'employee' })
=======
      Employee.countDocuments({ role: "manager" }),
      Employee.countDocuments({ role: "employee" }),
>>>>>>> master
    ]);

    const stats = {
      totalEmployees,
      managers,
      employees,
<<<<<<< HEAD
      managerPercentage: totalEmployees > 0 ? ((managers / totalEmployees) * 100).toFixed(2) : 0,
      employeePercentage: totalEmployees > 0 ? ((employees / totalEmployees) * 100).toFixed(2) : 0
    };

    res.status(200).json({
      message: 'Employee statistics retrieved successfully',
      data: stats
    });
  } catch (err) {
    console.error('Get Employee Stats Error:', err);
    res.status(500).json({ 
      message: 'Error fetching employee statistics', 
      error: err.message 
=======
      managerPercentage:
        totalEmployees > 0 ? ((managers / totalEmployees) * 100).toFixed(2) : 0,
      employeePercentage:
        totalEmployees > 0
          ? ((employees / totalEmployees) * 100).toFixed(2)
          : 0,
    };

    res.status(200).json({
      message: "Employee statistics retrieved successfully",
      data: stats,
    });
  } catch (err) {
    console.error("Get Employee Stats Error:", err);
    res.status(500).json({
      message: "Error fetching employee statistics",
      error: err.message,
>>>>>>> master
    });
  }
};

<<<<<<< HEAD
exports.handleFileUpload = handleFileUpload; 
=======
exports.handleFileUpload = handleFileUpload;
>>>>>>> master
