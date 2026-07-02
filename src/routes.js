import { Router } from "express";
import multer from "multer";
import * as jobController from "./controllers/jobController.js";
import * as applicationController from "./controllers/applicationController.js";
import * as contactController from "./controllers/contactController.js";
import * as authController from "./controllers/authController.js";
import authMiddleware from "./middleware/authMiddleware.js";

const router = Router();

// Configure multer for server-side file buffering (used for resume uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit files to 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF documents are supported for resume uploads."), false);
    }
  },
});

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================
router.post("/auth/login", authController.login);
router.get("/public/jobs", jobController.getPublicJobs);
router.get("/public/job/:id", jobController.getPublicJobDetail);
router.post("/public/apply-job", upload.single("resume"), applicationController.submitApplication);
router.post("/public/enquiry", contactController.submitContact);
router.post("/public/chat", contactController.chatAi)

// ==========================================
// PRIVATE/ADMIN ENDPOINTS
// ==========================================
router.get("/admin/jobs", authMiddleware, jobController.getAdminJobs);
router.post("/admin/jobs", authMiddleware, jobController.createJob);
router.get("/admin/jobs/:id", authMiddleware, jobController.getJobDetail);
router.put("/admin/jobs/:id", authMiddleware, jobController.updateJob);
router.delete("/admin/jobs/:id", authMiddleware, jobController.deleteJob);

router.get("/admin/applications", authMiddleware, applicationController.getAdminApplications);
router.put("/admin/applications/:id/status", authMiddleware, applicationController.updateStatus);
router.put("/admin/applications/:id/bookmark", authMiddleware, applicationController.toggleBookmark);

router.get("/admin/enquiry", authMiddleware, contactController.getAdminContacts);
router.put("/admin/enquiry/:id/resolve", authMiddleware, contactController.toggleResolved);

export default router;
