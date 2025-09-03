require("dotenv").config();
const Manager = require("../models/Manager");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage }).any();

const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
    }
    next();
  });
};

// Add Manager (Admin function)
exports.addManager = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Check if manager already exists with same email or phone
    const existingManager = await Manager.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (existingManager) {
      return res.status(400).json({
        message: "Manager already exists with this email or phone number",
      });
    }

    let livePictureUrl = "";
    if (req.files && req.files.length > 0) {
      const file = req.files.find((f) => f.fieldname === "livePicture");
      if (file) {
        // Validate live picture using AWS face recognition
        const {
          validateImageForFaceRecognition,
          detectFaces,
          cleanupTempImage,
        } = require("../utils/imageUtils");

        console.log(
          "🔍 Validating manager live picture for face recognition..."
        );

        // Validate image quality for face recognition
        const imageValidation = validateImageForFaceRecognition(file.path);
        if (!imageValidation.valid) {
          // Clean up temporary file
          cleanupTempImage(file.path);

          return res.status(400).json({
            message: imageValidation.message,
            error: imageValidation.error,
          });
        }

        // Detect faces in the uploaded image
        const { detectFaces: awsDetectFaces } = require("../config/aws");
        const imageBuffer = require("fs").readFileSync(file.path);
        const faceDetection = await awsDetectFaces(imageBuffer);

        if (!faceDetection.success) {
          console.log("❌ No faces detected in manager image");
          cleanupTempImage(file.path);

          return res.status(400).json({
            message:
              "No faces detected in the uploaded image. Please ensure a clear face image is provided.",
            error: "NO_FACE_DETECTED",
          });
        }

        if (faceDetection.faceCount > 1) {
          console.log("❌ Multiple faces detected in manager image");
          cleanupTempImage(file.path);

          return res.status(400).json({
            message:
              "Multiple faces detected in the image. Please use an image with only one face.",
            error: "MULTIPLE_FACES",
          });
        }

        console.log("✅ Manager live picture validation successful!");

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "salon-managers",
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        });
        livePictureUrl = result.secure_url;

        // Clean up temporary file after successful upload
        cleanupTempImage(file.path);
      }
    }

    if (!livePictureUrl) {
      return res.status(400).json({
        message: "Live picture is required for manager authentication",
      });
    }

    const manager = new Manager({
      name,
      email,
      phoneNumber,
      password,
      livePicture: livePictureUrl,
    });

    await manager.save();
    res.status(201).json({
      message: "Manager added successfully",
      manager: {
        managerId: manager.managerId,
        name: manager.name,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        role: manager.role,
        isActive: manager.isActive,
        createdAt: manager.createdAt,
      },
    });
  } catch (err) {
    console.error("Add Manager Error:", err);
    res.status(400).json({
      message: "Add manager error",
      error: err.message,
    });
  }
};

// Manager Login with Live Picture Verification
exports.managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find manager by email
    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (manager.isLocked()) {
      return res.status(423).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      });
    }

    // Check if manager is active
    if (!manager.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await manager.comparePassword(password);
    if (!isPasswordValid) {
      await manager.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if live picture is provided
    if (!req.files || !req.files.livePicture) {
      return res.status(400).json({
        success: false,
        message: "Live picture is required for authentication",
      });
    }

    // Upload and verify live picture
    const loginPicture = req.files.find((f) => f.fieldname === "livePicture");
    if (!loginPicture) {
      return res.status(400).json({
        success: false,
        message: "Live picture is required for authentication",
      });
    }

    // Upload login picture to Cloudinary
    const loginPictureResult = await cloudinary.uploader.upload(
      loginPicture.path,
      {
        folder: "salon-managers-login",
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      }
    );

    // Enhanced AWS Face Recognition Integration
    const {
      enhancedFaceComparison,
      validateImageForFaceRecognition,
      cleanupTempImage,
    } = require("../utils/imageUtils");

    // Validate login image quality
    const imageValidation = validateImageForFaceRecognition(loginPicture.path);
    if (!imageValidation.valid) {
      return res.status(400).json({
        success: false,
        message: imageValidation.message,
        error: imageValidation.error,
      });
    }

    // Get stored image path from Cloudinary URL
    // For now, we'll use the stored image URL directly
    // In production, you might want to download the image first

    // Perform enhanced face comparison
    const faceComparison = await enhancedFaceComparison(
      manager.livePicture, // This should be the stored image path
      loginPicture.path
    );

    if (!faceComparison.success || !faceComparison.isMatch) {
      // Clean up temporary image
      cleanupTempImage(loginPicture.path);

      return res.status(401).json({
        success: false,
        message: faceComparison.message,
        similarity: faceComparison.similarity,
        error: faceComparison.error,
      });
    }

    console.log(
      `Face verification successful! Similarity: ${faceComparison.similarity}%, Confidence: ${faceComparison.confidence}`
    );

    // Clean up temporary image after successful verification
    cleanupTempImage(loginPicture.path);

    // Reset login attempts on successful login
    await manager.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      {
        managerId: manager._id,
        email: manager.email,
        role: manager.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        manager: {
          managerId: manager.managerId,
          name: manager.name,
          email: manager.email,
          phoneNumber: manager.phoneNumber,
          role: manager.role,
          lastLogin: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Manager Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Face Login for Manager (Generate JWT token after face verification)
exports.managerFaceLogin = async (req, res) => {
  try {
    const { managerId, name, faceVerified } = req.body;

    if (!managerId || !name || !faceVerified) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for face login",
      });
    }

    // Find manager by ID
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Check if manager is active
    if (!manager.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        managerId: manager._id,
        email: manager.email,
        role: manager.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Face login successful",
      data: {
        token,
        manager: {
          managerId: manager.managerId,
          name: manager.name,
          email: manager.email,
          phoneNumber: manager.phoneNumber,
          role: manager.role,
          lastLogin: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Manager Face Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Manager Profile
exports.getManagerProfile = async (req, res) => {
  try {
    const managerId = req.managerId; // From JWT token

    const manager = await Manager.findById(managerId).select("-password");
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manager profile retrieved successfully",
      data: manager,
    });
  } catch (error) {
    console.error("Get Manager Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Manager Profile
exports.updateManagerProfile = async (req, res) => {
  try {
    const managerId = req.managerId;
    const { name, phoneNumber } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    updateData.updatedAt = new Date();

    // Handle live picture update
    if (req.files && req.files.length > 0) {
      const file = req.files.find((f) => f.fieldname === "livePicture");
      if (file) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "salon-managers",
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        });
        updateData.livePicture = result.secure_url;
      }
    }

    const manager = await Manager.findByIdAndUpdate(managerId, updateData, {
      new: true,
    }).select("-password");

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: manager,
    });
  } catch (error) {
    console.error("Update Manager Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Change Manager Password
exports.changeManagerPassword = async (req, res) => {
  try {
    const managerId = req.managerId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await manager.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    manager.password = newPassword;
    manager.updatedAt = new Date();
    await manager.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Manager Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get All Managers (Admin function)
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Managers retrieved successfully",
      data: managers,
      total: managers.length,
    });
  } catch (error) {
    console.error("Get All Managers Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Manager by ID (Admin function)
exports.getManagerById = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await Manager.findById(id).select("-password");
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manager retrieved successfully",
      data: manager,
    });
  } catch (error) {
    console.error("Get Manager by ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Manager (Admin function)
exports.updateManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    // Handle live picture update
    if (req.files && req.files.length > 0) {
      const file = req.files.find((f) => f.fieldname === "livePicture");
      if (file) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "salon-managers",
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        });
        updateData.livePicture = result.secure_url;
      }
    }

    const manager = await Manager.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manager updated successfully",
      data: manager,
    });
  } catch (error) {
    console.error("Update Manager Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete Manager (Admin function)
exports.deleteManager = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await Manager.findByIdAndDelete(id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manager deleted successfully",
      data: { deletedManager: manager },
    });
  } catch (error) {
    console.error("Delete Manager Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Manager Logout
exports.managerLogout = async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Manager Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Manager Face Recognition Login
exports.login = async (req, res) => {
  try {
    // Face Recognition Login for Manager
    if (!req.file) {
      return res.status(400).json({
        message: "Face image is required for manager login",
      });
    }

    // Import face recognition utilities
    const {
      enhancedFaceComparison,
      validateImageForFaceRecognition,
      cleanupTempImage,
    } = require("../utils/imageUtils");

    // Validate image quality
    const imageValidation = validateImageForFaceRecognition(req.file.path);
    if (!imageValidation.valid) {
      cleanupTempImage(req.file.path);
      return res.status(400).json({
        message: imageValidation.message,
        error: imageValidation.error,
      });
    }

    // Get all managers to compare faces
    const managers = await Manager.find({
      livePicture: { $exists: true, $ne: "" },
    });

    if (managers.length === 0) {
      cleanupTempImage(req.file.path);
      return res.status(404).json({
        message: "No managers found with registered faces",
      });
    }

    let matchedManager = null;
    let highestSimilarity = 0;

    // Compare with each manager's face
    for (const manager of managers) {
      try {
        const faceComparison = await enhancedFaceComparison(
          manager.livePicture, // Stored manager image URL
          req.file.path // Current login image
        );

        if (
          faceComparison.success &&
          faceComparison.isMatch &&
          faceComparison.similarity > highestSimilarity
        ) {
          matchedManager = manager;
          highestSimilarity = faceComparison.similarity;
        }
      } catch (comparisonError) {
        console.error(
          `Face comparison error for manager ${manager.managerId}:`,
          comparisonError
        );
        continue;
      }
    }

    // Clean up temporary file
    cleanupTempImage(req.file.path);

    if (!matchedManager) {
      return res.status(401).json({
        message:
          "Face not recognized. Please ensure you are a registered manager.",
        error: "FACE_NOT_RECOGNIZED",
      });
    }

    // Generate JWT token for manager
    const token = jwt.sign(
      {
        managerId: matchedManager._id,
        managerDbId: matchedManager.managerId,
        email: matchedManager.email,
        role: "manager",
        name: matchedManager.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Manager face recognition login successful",
      token,
      manager: {
        id: matchedManager._id,
        managerId: matchedManager.managerId,
        name: matchedManager.name,
        email: matchedManager.email,
        role: "manager",
      },
      faceMatch: {
        similarity: highestSimilarity,
        confidence: "high",
      },
      redirectTo: "/manager-panel",
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      cleanupTempImage(req.file.path);
    }

    console.error("Manager Face Login Error:", error);
    res.status(500).json({
      message: "Face recognition login failed",
      error: error.message,
    });
  }
};

exports.handleFileUpload = handleFileUpload;
