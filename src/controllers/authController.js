import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

/**
 * Public Route: Authenticate Admin Credentials & Issue signed JWT.
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Lookup administrator account
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      // Keep error message generic for security
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Verify hashed password matches
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || "owlstip_dashboard_secret_key_2026";
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      secret,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    console.log(`[Auth] Administrator ${admin.email} successfully logged in.`);

    return res.status(200).json({
      message: "Authentication successful!",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("[authController.login] Error:", error);
    return res.status(500).json({ error: "Authentication system error. Please try again." });
  }
}
