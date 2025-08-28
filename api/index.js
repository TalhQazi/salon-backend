const serverless = require("serverless-http");
const app = require("../app");

<<<<<<< HEAD
module.exports = serverless(app);


=======
module.exports.handler = serverless(app);
>>>>>>> master
