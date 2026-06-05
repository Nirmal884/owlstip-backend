import prisma from "../lib/prisma.js";

export async function getAllJobs(filter = {}, page, limit) {
  const whereClause = {
    ...filter,
    deletedAt: null,
  };

  if (page && limit) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, jobs, activeCount, draftCount, closedCount] = await prisma.$transaction([
      prisma.job.count({ where: whereClause }),
      prisma.job.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limitNum,
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where: { status: "ACTIVE", deletedAt: null } }),
      prisma.job.count({ where: { status: "DRAFT", deletedAt: null } }),
      prisma.job.count({ where: { status: "CLOSED", deletedAt: null } })
    ]);
    return { total, jobs, activeCount, draftCount, closedCount };
  }

  return await prisma.job.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });
}

/**
 * Get a specific job posting by ID.
 * @param {string} id - The job UUID
 */
export async function getJobById(id) {
  return await prisma.job.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      applications: true,
    },
  });
}

/**
 * Create a new job vacancy.
 * @param {Object} jobData
 */
export async function createJob(jobData) {
  return await prisma.job.create({
    data: {
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      department: jobData.department,
      location: jobData.location,
      type: jobData.type,
      experience: jobData.experience,
      status: jobData.status || "DRAFT",
    },
  });
}

/**
 * Update an existing job vacancy.
 * @param {string} id - Job UUID
 * @param {Object} jobData - Fields to update
 */
export async function updateJob(id, jobData) {
  return await prisma.job.update({
    where: { id },
    data: {
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      department: jobData.department,
      location: jobData.location,
      type: jobData.type,
      status: jobData.status,
    },
  });
}

/**
 * Delete a job vacancy.
 * @param {string} id - Job UUID
 */
export async function deleteJob(id) {
  return await prisma.job.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
