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
    const statuses = Array.isArray(filter.status)
      ? filter.status
      : typeof filter.status === "string"
      ? filter.status.split(",").map((s) => s.trim())
      : [filter.status];
    whereClause.status = { in: statuses };
  }
  if (filter.today) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    whereClause.createdAt = {
      gte: startOfToday,
      lte: endOfToday,
    };
  }

  if (filter.search) {
    whereClause.OR = [
      { name: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
      {
        job: {
          title: { contains: filter.search, mode: "insensitive" },
        },
      },
    ];
  }

  if (page && limit) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const baseWhere = filter.jobId ? { jobId: filter.jobId } : {};

    const [total, todayApplied, applied, reviewing, interview, rejected, applications] = await prisma.$transaction([
      prisma.application.count({ where: whereClause }),
      prisma.application.count({
        where: { ...baseWhere, createdAt: { gte: startOfToday, lte: endOfToday } }
      }),
      prisma.application.count({ where: { ...baseWhere, status: "APPLIED" } }),
      prisma.application.count({ where: { ...baseWhere, status: "REVIEWING" } }),
      prisma.application.count({ where: { ...baseWhere, status: "INTERVIEW_SCHEDULED" } }),
      prisma.application.count({ where: { ...baseWhere, status: "REJECTED" } }),
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
    return { total, todayApplied, applied, reviewing, interview, rejected, applications };
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

/**
 * Update the bookmark status of an application.
 * @param {string} id - Application UUID
 * @param {boolean} isBookmarked - true or false
 */
export async function updateApplicationBookmark(id, isBookmarked) {
  return await prisma.application.update({
    where: { id },
    data: { isBookmarked },
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
