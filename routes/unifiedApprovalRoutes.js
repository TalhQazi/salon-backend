const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getAllPendingApprovals,
  approveDeclineRequest,
  getApprovalStats,
  getRequestDetails,
} = require("../controller/unifiedApprovalController");

// Get All Pending Approvals (Unified Dashboard)
<<<<<<< HEAD
router.get("/pending", authenticate, getAllPendingApprovals);

// Approve/Decline Request (Unified)
router.put(
  "/approve/:requestType/:requestId",
  authenticate,
  approveDeclineRequest
);

// Get Approval Statistics
router.get("/stats", authenticate, getApprovalStats);

// Get Request Details by Type and ID
router.get("/details/:requestType/:requestId", authenticate, getRequestDetails);
=======
router.get("/pending", getAllPendingApprovals);

// Approve/Decline Request (Unified)
router.put("/approve/:requestType/:requestId", approveDeclineRequest);

// Get Approval Statistics
router.get("/stats", getApprovalStats);

// Get Request Details by Type and ID
router.get("/details/:requestType/:requestId", getRequestDetails);
>>>>>>> ee42a375675c463dac2b0b73b81fa7f44145c240

module.exports = router;
