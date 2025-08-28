const express = require("express");
const router = express.Router();

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  addClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats,
  searchClients,
} = require("../controller/clientController");

// All routes require manager authentication
router.use(authenticate);
router.use(authorizeRoles("manager"));

// Client CRUD operations
router.post("/add", addClient);
router.get("/all", getAllClients);
router.get("/search", searchClients);
router.get("/stats", getClientStats);
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

module.exports = router;
