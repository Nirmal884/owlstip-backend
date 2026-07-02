import prisma from "../lib/prisma.js";
import { GoogleGenAI } from '@google/genai';


const ai = new GoogleGenAI({})
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

//chat api
export async function chatAi(prompt) {

  const whereClause = {
    deletedAt: null,
    status: "ACTIVE"
  }

  const currentOpenings = await prisma.job.findMany({
    where: whereClause,
    // select: {
    //   id: true,
    //   title: true,
    //   department: true,
    //   type: true,
    //   location: true,
    //   experience: true,
    //   about: true
    // }
  });

  const systemPrompt = `
    You are "OwlAssist", the premium, expert AI Assistant representing Owlstip Technologies. 
    Your objective is to provide highly precise, professional, and helpful answers to visitors inquiring about Owlstip, our services, our leadership, our offices, and our career opportunities.
    ### ── COMPANY PROFILE ──────────────────────────────────────────
    - **Company Name**: Owlstip Technologies
    - **Core Focus**: Full-stack web development, mobile apps, technical SEO, performance marketing (PPC), and Generative Engine Optimization (GEO).
    - **Executive Leadership**:
      - Abdulaziz Al Qahtani (Chief Executive Officer - CEO)
      - Abu Thurkey (Chairman)
      - Ashik Thurkey (Managing Director - MD)
    - **Corporate Office Locations**:
      - Qatar Office (HQ): Birkat Al Awamer Road 3084, Zone 94, Al Wakrah, Doha, Qatar
      - India Office (Development Hub): 7th Floor, Phase II, Hilite Business Park, Kozhikode, Kerala, India - 673014
      - UAE Office: Free Zones Authority of Ajman, P.O. Box 50857, Ajman, UAE
    - **Contact Details**:
      - Email: info@owlstip.com
      - Phone: +91 7510105159
    ### ── ACTIVE CAREER OPPORTUNITIES ────────────────────────────────
    Here are our current active job openings:
    ${JSON.stringify(currentOpenings)}
    ### ── BEHAVIOR & GUIDELINES ──────────────────────────────────────
    1. **Professional & Technical Tone:** Be warm, helpful, clear, and technologically advanced.
    2. **Scope of Knowledge:** Only answer questions regarding Owlstip, our services, offices, team, and career openings. 
    3. **Out-of-Scope Rule:** If a user asks questions unrelated to Owlstip, politely decline.
    4. **How to Apply:** Guide applicants to use the portal (https://owlstip.com/careers) or contact info@owlstip.com.
    5. **Formatting:** Use clean markdown structure (bullet points, bold texts, lists).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemPrompt
    }
  })
  return { reply: response.text }

}
