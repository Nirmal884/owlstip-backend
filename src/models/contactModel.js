import prisma from "../lib/prisma.js";

/**
 * Get all contact submissions, optionally filtering by resolution status.
 * @param {Object} [filter] - Optional filter (e.g. { isResolved: false })
 */
export async function getAllContacts(filter = {}, page = 1, limit = 10) {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [total, contacts] = await prisma.$transaction([
    prisma.contact.count({ where: filter }),
    prisma.contact.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: limitNum,
    })
  ]);
  return { total, contacts };
}

/**
 * Create a new contact form submission.
 * @param {Object} contactData - Name, email, phone, services, message
 */
export async function createContact(contactData) {
  return await prisma.contact.create({
    data: {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      services: contactData.services,
      message: contactData.message,
      isResolved: false,
    },
  });
}

/**
 * Update the resolution status of a contact form submission.
 * @param {string} id - Contact UUID
 * @param {boolean} isResolved - Whether it is resolved or not
 */
export async function resolveContact(id, isResolved) {
  return await prisma.contact.update({
    where: { id },
    data: { isResolved },
  });
}
