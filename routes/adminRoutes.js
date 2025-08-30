const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controller/employeeController");

// CRUD routes
router.get("/all", getAllEmployees);
router.get("/:id", getEmployeeById);
router.post("/add", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
