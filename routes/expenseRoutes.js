const express = require("express");
const router = express.Router();
const {
  addExpense,
  getAllExpenses,
  getPendingExpenses,
  approveDeclineExpense,
  getExpenseById,
  getExpenseStats,
  handleFileUpload,
} = require("../controller/expenseController");

// Add Expense (Manager/Admin)
router.post("/add", handleFileUpload, addExpense);

// Get All Expenses (with filters)
router.get("/all", getAllExpenses);

// Get Pending Expenses (Admin)
router.get("/pending", getPendingExpenses);

// Approve/Decline Expense (Admin)
router.put("/:expenseId", approveDeclineExpense);

// Get Expense by ID
router.get("/:expenseId", getExpenseById);

// Get Expense Statistics (Admin)
router.get("/stats", getExpenseStats);

module.exports = router;
