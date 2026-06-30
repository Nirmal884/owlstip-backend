import * as jobModel from "../models/jobModel.js";
import { generateUniqueSlug } from "../utils/slugify.js";

// Public: Fetch all active job postings
export async function getPublicJobs(req, res) {
  try {
    const jobs = await jobModel.getAllJobs({ status: "ACTIVE" });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("[jobController.getPublicJobs] Error:", error);
    return res.status(500).json({ error: "Failed to fetch active job postings." });
  }
}

// Admin: Fetch all job postings (including Draft and Closed)
export async function getAdminJobs(req, res) {
  try {
    const { page, limit } = req.query;
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const { total, jobs, activeCount, draftCount, closedCount } = await jobModel.getAllJobs({}, pageNum, limitNum);
      return res.status(200).json({ total, jobs, activeCount, draftCount, closedCount });
    }
    const jobs = await jobModel.getAllJobs();
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("[jobController.getAdminJobs] Error:", error);
    return res.status(500).json({ error: "Failed to fetch job postings." });
  }
}

// Admin/Public: Fetch details of a single job
export async function getJobDetail(req, res) {
  try {
    const { id } = req.params;
    const job = await jobModel.getJobById(id);
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.error("[jobController.getJobDetail] Error:", error);
    return res.status(500).json({ error: "Failed to fetch job details." });
  }
}

// Public: Fetch details of a single active job
export async function getPublicJobDetail(req, res) {
  try {
    const { id } = req.params;
    const job = await jobModel.getPublicJobById(id);
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.error("[jobController.getPublicJobDetail] Error:", error);
    return res.status(500).json({ error: "Failed to fetch job details." });
  }
}

// Admin: Create a new job vacancy
export async function createJob(req, res) {
  try {
    const { title, department, location, type, description, requirements, responsibilities, status, experience } = req.body;

    if (!title || !department || !location || !type || !description || !requirements || !responsibilities || !experience) {
      return res.status(400).json({ error: "All fields except status are required." });
    }

    const slug = await generateUniqueSlug(title);

    const newJob = await jobModel.createJob({
      title,
      slug,
      department,
      location,
      type,
      description,
      requirements,
      responsibilities,
      experience,
      status: status || "DRAFT",
    });

    return res.status(201).json(newJob);
  } catch (error) {
    console.error("[jobController.createJob] Error:", error);
    return res.status(500).json({ error: "Failed to create job vacancy." });
  }
}

// Admin: Update an existing job vacancy
export async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const { title, department, location, type, experience, description, requirements, responsibilities, status } = req.body;

    const existingJob = await jobModel.getJobById(id);
    if (!existingJob) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    const updatedJob = await jobModel.updateJob(id, {
      title: title || existingJob.title,
      department: department || existingJob.department,
      location: location || existingJob.location,
      type: type || existingJob.type,
      experience: experience || existingJob.experience,
      description: description || existingJob.description,
      requirements: requirements || existingJob.requirements,
      responsibilities: responsibilities || existingJob.responsibilities,
      status: status || existingJob.status,
    });

    return res.status(200).json(updatedJob);
  } catch (error) {
    console.error("[jobController.updateJob] Error:", error);
    return res.status(500).json({ error: "Failed to update job vacancy." });
  }
}

// Admin: Delete a job vacancy
export async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    const existingJob = await jobModel.getJobById(id);
    if (!existingJob) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    await jobModel.deleteJob(id);
    return res.status(200).json({ message: "Job posting deleted successfully." });
  } catch (error) {
    console.error("[jobController.deleteJob] Error:", error);
    return res.status(500).json({ error: "Failed to delete job vacancy." });
  }
}
