const Admin = require("../models/Admin");
const Manager = require("../models/Manager");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const os = require("os");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const {
  cleanupTempImage,
  validateImageForFaceRecognition,
} = require("../utils/imageUtils");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Handle file upload
const handleFileUpload = upload.single("livePicture");

// Strong Password Validation Function
function validatePassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  const requirements = [
    "Minimum 8 characters",
    "At least one uppercase letter (A-Z)",
    "At least one number (0-9) OR special character (!@#$%^&* etc.)",
  ];

  if (password.length < minLength) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!hasNumberOrSpecial) {
    errors.push(
      "Password must contain at least one number or special character"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
  };
}

// Step 1: Submit User Form Data (without face)
exports.submitUserForm = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      role,
      employeeId,
      monthlySalary,
      idCardNumber,
    } = req.body;

    const validRoles = ["admin", "manager", "employee"];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        message: "Valid role is required",
        validRoles,
      });
    }

    const userRole = role.toLowerCase();

    // Basic validation
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Email/password checks for admin/manager
    if (userRole === "admin" || userRole === "manager") {
      if (!email) return res.status(400).json({ message: "Email is required" });

      if (!password) {
        return res.status(400).json({
          message: "Password is required for admin and manager roles",
          requirements: [
            "Minimum 8 characters",
            "At least one uppercase letter (A-Z)",
            "At least one number (0-9) OR special character (!@#$%^&* etc.)",
          ],
        });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          message: "Password does not meet requirements",
          errors: passwordValidation.errors,
          requirements: passwordValidation.requirements,
        });
      }

      if (!confirmPassword) {
        return res
          .status(400)
          .json({ message: "Please confirm your password" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Check email uniqueness
      const existingAdmin = await Admin.findOne({ email });
      const existingManager = await Manager.findOne({ email });
      if (existingAdmin || existingManager) {
        return res.status(400).json({
          message: "Email already registered. Please use a different email.",
        });
      }
    }

    if (!phoneNumber)
      return res.status(400).json({ message: "Phone number is required" });

    if (userRole === "employee" && !employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }
    if (userRole === "employee" && !monthlySalary) {
      return res.status(400).json({ message: "Monthly salary is required" });
    }
    if (userRole === "employee" && !idCardNumber) {
      return res.status(400).json({ message: "ID Card Number is required" });
    }

    // Phone uniqueness check
    const existingPhoneAdmin = await Admin.findOne({ phoneNumber });
    const existingPhoneManager = await Manager.findOne({ phoneNumber });
    const existingPhoneEmployee = await Employee.findOne({ phoneNumber });
    if (existingPhoneAdmin || existingPhoneManager || existingPhoneEmployee) {
      return res.status(400).json({
        message:
          "Phone number already registered. Please use a different phone number.",
      });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const tempUserData = {
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: userRole,
      employeeId,
      monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null,
      idCardNumber,
    };

    res.status(200).json({
      message: "Step 1 completed. Please proceed to face capture.",
      nextStep: "face_capture",
      tempUserId: Buffer.from(JSON.stringify(tempUserData)).toString("base64"),
      user: {
        name,
        role: userRole,
        phoneNumber,
        ...(userRole === "employee" && {
          employeeId,
          monthlySalary,
          idCardNumber,
        }),
        ...(userRole !== "employee" && { email }),
      },
    });
  } catch (err) {
    console.error("Submit User Form Error:", err);
    res.status(400).json({ message: "Submit form error", error: err.message });
  }
};

// Step 2: Capture Face and Complete User Creation
exports.captureUserFace = async (req, res) => {
  try {
    const { tempUserId } = req.body;
    if (!tempUserId) {
      return res.status(400).json({ message: "Temp user ID is required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Face image is required" });
    }

    let tempUserData;
    try {
      tempUserData = JSON.parse(
        Buffer.from(tempUserId, "base64").toString("utf8")
      );
    } catch (error) {
      return res.status(400).json({ message: "Invalid temp user ID" });
    }

    // Validate face image
    const imageValidation = await validateImageForFaceRecognition(
      req.file.path
    );
    if (!imageValidation.valid) {
      cleanupTempImage(req.file.path);
      return res.status(400).json({
        message: imageValidation.message,
        error: imageValidation.error,
      });
    }

    console.log(
      "✅ Live picture validation passed, uploading to Cloudinary..."
    );

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `salon-${tempUserData.role}s`,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
    });

    cleanupTempImage(req.file.path);

    let newUser;
    let responseData;

    switch (tempUserData.role) {
      case "admin":
        newUser = new Admin({
          name: tempUserData.name,
          email: tempUserData.email,
          password: tempUserData.password,
          phoneNumber: tempUserData.phoneNumber,
          livePicture: result.secure_url,
        });
        await newUser.save();
        responseData = {
          id: newUser._id,
          adminId: newUser.adminId,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: "admin",
          hasPassword: true,
          livePicture: newUser.livePicture,
        };
        break;

      case "manager":
        newUser = new Manager({
          name: tempUserData.name,
          email: tempUserData.email,
          password: tempUserData.password,
          phoneNumber: tempUserData.phoneNumber,
          livePicture: result.secure_url,
        });
        await newUser.save();
        responseData = {
          id: newUser._id,
          managerId: newUser.managerId,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: "manager",
          hasPassword: true,
          livePicture: newUser.livePicture,
        };
        break;

      case "employee":
        newUser = new Employee({
          name: tempUserData.name,
          employeeId: tempUserData.employeeId,
          phoneNumber: tempUserData.phoneNumber,
          monthlySalary: tempUserData.monthlySalary,
          idCardNumber: tempUserData.idCardNumber,
          livePicture: result.secure_url,
        });
        await newUser.save();
        responseData = {
          id: newUser._id,
          employeeId: newUser.employeeId,
          name: newUser.name,
          phoneNumber: newUser.phoneNumber,
          monthlySalary: newUser.monthlySalary,
          idCardNumber: newUser.idCardNumber,
          role: "employee",
          hasPassword: false,
          livePicture: newUser.livePicture,
        };
        break;
    }

    res.status(201).json({
      message: `${
        tempUserData.role.charAt(0).toUpperCase() + tempUserData.role.slice(1)
      } registered successfully`,
      user: responseData,
      loginMethod:
        tempUserData.role === "employee"
          ? "Face recognition only (via manager panel)"
          : "Face recognition only",
      nextAction:
        tempUserData.role === "employee"
          ? "Employee can now perform operations via manager panel"
          : `${
              tempUserData.role.charAt(0).toUpperCase() +
              tempUserData.role.slice(1)
            } can now login with face recognition`,
    });
  } catch (err) {
    console.error("Capture User Face Error:", err);
    if (req.file) cleanupTempImage(req.file.path);
    res.status(400).json({ message: "Face capture error", error: err.message });
  }
};

// Legacy compatibility
exports.addUser = exports.captureUserFace;
exports.handleFileUpload = handleFileUpload;
