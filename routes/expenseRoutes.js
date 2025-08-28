const express = require("express");
const router = express.Router();
const {
  addExpense,
  getAllExpenses,
  getPendingExpenses,
<<<<<<< HEAD
=======
  getManagerPendingExpenses,
>>>>>>> master
  approveDeclineExpense,
  getExpenseById,
  getExpenseStats,
  handleFileUpload,
} = require("../controller/expenseController");
<<<<<<< HEAD

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
=======
const { authenticate } = require("../middleware/authMiddleware");

// Add Expense (Manager/Admin) - Protected route
router.post("/add", authenticate, handleFileUpload, addExpense);

// Get All Expenses (with filters) - Protected route
router.get("/all", authenticate, getAllExpenses);

// Get Pending Expenses (Admin) - Protected route
router.get("/pending", authenticate, getPendingExpenses);

// Get Manager's Pending Expenses - Protected route
router.get("/manager/pending", authenticate, getManagerPendingExpenses);

// Approve/Decline Expense (Admin) - Protected route
router.put("/:expenseId", authenticate, approveDeclineExpense);

// Get Expense by ID - Protected route
router.get("/:expenseId", authenticate, getExpenseById);

// Get Expense Statistics (Admin) - Protected route
router.get("/stats", authenticate, getExpenseStats);
>>>>>>> master

module.exports = router;
