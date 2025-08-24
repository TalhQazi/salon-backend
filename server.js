const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
// const cloudinary = require('cloudinary').v2;
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Load env variables
dotenv.config();

// Create express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Import Routes
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/authRoute");
const productRoutes = require("./routes/productRoutes");
const dealRoutes = require("./routes/dealRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const advanceSalaryRoutes = require("./routes/advanceSalaryRoutes");
const adminAdvanceSalaryRoutes = require("./routes/adminAdvanceSalaryRoutes");
const unifiedApprovalRoutes = require("./routes/unifiedApprovalRoutes");
const advanceBookingRoutes = require("./routes/advanceBookingRoutes");
const managerAuthRoutes = require("./routes/managerAuthRoutes");
const clientRoutes = require("./routes/clientRoutes");
const adminClientRoutes = require("./routes/adminClientRoutes");
const billRoutes = require("./routes/billRoutes");

// Use Routes
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/advance-salary", advanceSalaryRoutes);
app.use("/api/admin-advance-salary", adminAdvanceSalaryRoutes);
app.use("/api/admin-approvals", unifiedApprovalRoutes);
app.use("/api/advance-bookings", advanceBookingRoutes);
app.use("/api/manager", managerAuthRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/admin-clients", adminClientRoutes);
app.use("/api/bills", billRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
