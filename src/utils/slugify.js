import prisma from "../lib/prisma.js";

/**
 * Converts a raw string to a URL-friendly slug.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")          // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start of text
    .replace(/-+$/, "");            // Trim - from end of text
}

/**
 * Generates a unique slug for a job.
 * If the slug already exists, appends an incremental suffix (-1, -2, etc.).
 * @param {string} title
 * @param {string|null} excludeJobId - Optional ID to exclude from search (for updates)
 * @returns {Promise<string>}
 */
export async function generateUniqueSlug(title, excludeJobId = null) {
  const baseSlug = slugify(title) || "job";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.job.findFirst({
      where: {
        slug: slug,
        deletedAt: null,
        NOT: excludeJobId ? { id: excludeJobId } : undefined,
      },
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
