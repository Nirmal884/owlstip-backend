import jwt from "jsonwebtoken";

/**
 * Express middleware to protect routes that require JWT Administrator Authentication.
 * Inspects 'Authorization: Bearer <token>' in request headers.
 */
export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Authentication token is missing." });
    }

    // Extract raw token
    const token = authHeader.split(" ")[1];

    // Verify token signature
    const secret = process.env.JWT_SECRET || "owlstip_dashboard_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    // Attach administrative context to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("[authMiddleware] JWT Verification Failed:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token has expired. Please log in again." });
    }
    
    return res.status(401).json({ error: "Invalid authentication token. Access denied." });
  }
}
