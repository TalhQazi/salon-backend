const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // TODO: restrict origin in production

// Routes
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

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Salon Backend API is running!",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI: process.env.MONGO_URI ? "Set" : "Not Set",
      JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not Set"
    }
  });
});

// Mongo connection (reuse across invocations)
if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB Error:", err));
}

module.exports = app;


