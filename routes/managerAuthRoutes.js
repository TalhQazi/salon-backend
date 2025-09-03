const express = require("express");
const router = express.Router();
const {
  addManager,
  login,
  managerFaceLogin,
  getManagerProfile,
  updateManagerProfile,
  changeManagerPassword,
  getAllManagers,
  getManagerById,
  updateManager,
  deleteManager,
  managerLogout,
  handleFileUpload,
} = require("../controller/managerAuthController");

const {
  authenticateManager,
  authorizeManager,
  checkManagerActive,
} = require("../middleware/managerAuthMiddleware");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.post("/login", handleFileUpload, login);
router.post("/face-login", managerFaceLogin);
router.post("/logout", managerLogout);

// Manager routes (requires manager authentication)
router.get(
  "/profile",
  authenticateManager,
  checkManagerActive,
  getManagerProfile
);
router.put(
  "/profile",
  authenticateManager,
  checkManagerActive,
  handleFileUpload,
  updateManagerProfile
);
router.put(
  "/change-password",
  authenticateManager,
  checkManagerActive,
  changeManagerPassword
);

// Admin routes (requires admin authentication)
router.post(
  "/admin/add",
  authenticate,
  authorizeRoles("admin"),
  handleFileUpload,
  addManager
);
router.get("/admin/all", authenticate, authorizeRoles("admin"), getAllManagers);
router.get("/admin/:id", authenticate, authorizeRoles("admin"), getManagerById);
router.put(
  "/admin/:id",
  authenticate,
  authorizeRoles("admin"),
  handleFileUpload,
  updateManager
);
router.delete(
  "/admin/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteManager
);

module.exports = router;
