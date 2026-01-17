const { sendError } = require("../utiles/response");

// ✅ Dummy auth (JWT can be added later)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return sendError(res, 401, "Unauthorized: Token missing");
  }

  next();
};

module.exports = authMiddleware;
