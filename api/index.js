const serverless = require("serverless-http");
const app = require("../app");

// Note: Vercel provides environment variables automatically
// No dotenv needed in serverless environment

module.exports = serverless(app);
