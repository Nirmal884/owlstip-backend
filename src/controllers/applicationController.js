import * as applicationModel from "../models/applicationModel.js";
import { uploadToS3 } from "../utils/s3.js";
import * as jobModel from "../models/jobModel.js";

// Public: Submit a candidate application (with PDF Resume Upload)
export async function submitApplication(req, res) {
  try {
    const { name, email, phone, experience, socialProfile, coverLetter, jobId } = req.body;
    const resumeFile = req.file;

    // Validate parameters
    if (!name || !email || !phone || !experience || !jobId) {
      return res.status(400).json({ error: "Name, email, phone, experience, and jobId are required." });
    }

    if (!resumeFile) {
      return res.status(400).json({ error: "Please upload your resume in PDF format." });
    }

    // Verify job posting exists and is ACTIVE
    const linkedJob = await jobModel.getJobById(jobId);
    if (!linkedJob) {
      return res.status(404).json({ error: "Target job posting not found." });
    }
    if (linkedJob.status !== "ACTIVE") {
      return res.status(400).json({ error: "This job vacancy is no longer open for applications." });
    }

    // Server-Side Upload to AWS S3
    const { Location: resumeUrl } = await uploadToS3(
      resumeFile.buffer,
      resumeFile.originalname,
      resumeFile.mimetype
    );

    // Save candidate application in DB
    const newApplication = await applicationModel.createApplication({
      jobId,
      name,
      email,
      phone,
      experience,
      socialProfile,
      coverLetter,
      resumeUrl,
      status: "APPLIED",
    });

    return res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
    });
  } catch (error) {
    console.error("[applicationController.submitApplication] Error:", error);
    return res.status(500).json({ error: "Failed to submit application. Please try again." });
  }
}

// Admin: Retrieve applications with optional status & job filtering
export async function getAdminApplications(req, res) {
  try {
    const { jobId, status, today, search, page, limit } = req.query;
    const filter = {};

    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;
    if (today === "true") filter.today = true;
    if (search) filter.search = search;

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const { total, todayApplied, applied, reviewing, interview, rejected, applications } = await applicationModel.getAllApplications(filter, pageNum, limitNum);
      return res.status(200).json({ total, todayApplied, applied, reviewing, interview, rejected, applications });
    }

    const applications = await applicationModel.getAllApplications(filter);
    return res.status(200).json(applications);
  } catch (error) {
    console.error("[applicationController.getAdminApplications] Error:", error);
    return res.status(500).json({ error: "Failed to retrieve job applications." });
  }
}

// Admin: Update application pipeline status (e.g. REVIEWING, INTERVIEW_SCHEDULED)
export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["APPLIED", "REVIEWING", "INTERVIEW_SCHEDULED", "REJECTED", "HIRED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value provided." });
    }

    const existingApp = await applicationModel.getApplicationById(id);
    if (!existingApp) {
      return res.status(404).json({ error: "Application record not found." });
    }

    const updatedApp = await applicationModel.updateApplicationStatus(id, status);
    return res.status(200).json(updatedApp);
  } catch (error) {
    console.error("[applicationController.updateStatus] Error:", error);
    return res.status(500).json({ error: "Failed to update application status." });
  }
}

// Admin: Update bookmark status of an application
export async function toggleBookmark(req, res) {
  try {
    const { id } = req.params;
    const { isBookmarked } = req.body;

    if (typeof isBookmarked !== "boolean") {
      return res.status(400).json({ error: "isBookmarked must be a boolean value." });
    }

    const existingApp = await applicationModel.getApplicationById(id);
    if (!existingApp) {
      return res.status(404).json({ error: "Application record not found." });
    }

    const updatedApp = await applicationModel.updateApplicationBookmark(id, isBookmarked);
    return res.status(200).json(updatedApp);
  } catch (error) {
    console.error("[applicationController.toggleBookmark] Error:", error);
    return res.status(500).json({ error: "Failed to update bookmark status." });
  }
}
