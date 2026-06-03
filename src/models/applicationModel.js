import prisma from "../lib/prisma.js";

/**
 * Get all job applications with optional filters (jobId, status).
 * Includes the linked job's title, department, etc.
 * @param {Object} [filter] - Optional filter object (e.g. { jobId: '...', status: 'APPLIED' })
 */
export async function getAllApplications(filter = {}, page, limit) {
  const whereClause = {};

  if (filter.jobId) {
    whereClause.jobId = filter.jobId;
  }
  if (filter.status) {
    whereClause.status = filter.status;
  }

  if (page && limit) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, applications] = await prisma.$transaction([
      prisma.application.count({ where: whereClause }),
      prisma.application.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limitNum,
        include: {
          job: {
            select: {
              title: true,
              department: true,
              location: true,
            },
          },
        },
      })
    ]);
    return { total, applications };
  }

  return await prisma.application.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          title: true,
          department: true,
          location: true,
        },
      },
    },
  });
}

/**
 * Get an application by its ID.
 * @param {string} id - Application UUID
 */
export async function getApplicationById(id) {
  return await prisma.application.findUnique({
    where: { id },
    include: {
      job: true,
    },
  });
}

/**
 * Create a new application submission.
 * @param {Object} appData - jobId, name, email, phone, coverLetter, resumeUrl, status
 */
export async function createApplication(appData) {
  return await prisma.application.create({
    data: {
      jobId: appData.jobId,
      name: appData.name,
      email: appData.email,
      phone: appData.phone,
      experience: appData.experience,
      socialProfile: appData.socialProfile,
      coverLetter: appData.coverLetter,
      resumeUrl: appData.resumeUrl,
      status: appData.status || "APPLIED",
    },
    include: {
      job: {
        select: {
          title: true,
          department: true,
        },
      },
    },
  });
}

/**
 * Update the status of an application.
 * @param {string} id - Application UUID
 * @param {string} status - APPLIED, REVIEWING, INTERVIEW_SCHEDULED, REJECTED, HIRED
 */
export async function updateApplicationStatus(id, status) {
  return await prisma.application.update({
    where: { id },
    data: { status },
    include: {
      job: {
        select: {
          title: true,
        },
      },
    },
  });
}
