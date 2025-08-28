<<<<<<< HEAD
const express = require('express');
const router = express.Router();
=======
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
>>>>>>> master
const {
  getAllPendingApprovals,
  approveDeclineRequest,
  getApprovalStats,
<<<<<<< HEAD
  getRequestDetails
} = require('../controller/unifiedApprovalController');

// Get All Pending Approvals (Unified Dashboard)
router.get('/pending', getAllPendingApprovals);

// Approve/Decline Request (Unified)
router.put('/approve/:requestType/:requestId', approveDeclineRequest);

// Get Approval Statistics
router.get('/stats', getApprovalStats);

// Get Request Details by Type and ID
router.get('/details/:requestType/:requestId', getRequestDetails);

module.exports = router; 
=======
  getRequestDetails,
} = require("../controller/unifiedApprovalController");

// Get All Pending Approvals (Unified Dashboard)
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

module.exports = router;
>>>>>>> master
