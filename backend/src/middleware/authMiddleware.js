
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // 1. Read the Authorization header
  const authHeader = req.headers.authorization;

  // 2. Require a Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  // 3. Verify the token's signature and expiration
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      message: "Authentication service is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // 4. Attach trusted token claims to the request
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    // 5. Continue to the protected route
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}

module.exports = { authenticateToken, };
