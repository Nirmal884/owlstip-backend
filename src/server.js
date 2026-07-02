import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import router from "./routes.js";

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors({
  origin: ["https://owlstip.com", "https://cms.owlstip.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static assets (fallbacks for S3 resumes stored on disk)
app.use(express.static("public"));

// Register API Routes
app.use("/api", router);

// Root Ping Route
app.get("/ping", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Owlstip Dashboard Backend is live." });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  if (err.message && err.message.includes("PDF")) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(err.status || 500).json({
    error: err.message || "An unexpected error occurred on the server.",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`================================================`);
});
