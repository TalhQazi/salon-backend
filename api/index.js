const serverless = require("serverless-http");
const app = require("../app");

// ✅ Sirf development mode me .env load karo
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = serverless(app);
