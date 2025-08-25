const express = require('express');
const router = express.Router();
const {
  getAllPendingApprovals,
  approveDeclineRequest,
  getApprovalStats,
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