import * as contactModel from "../models/contactModel.js";

const VALID_ENUM_VALUES = new Set([
  "WEB_DEVELOPMENT",
  "APP_DEVELOPMENT",
  "UI_UX_DESIGN",
  "DIGITAL_MARKETING",
  "SEO_OPTIMIZATION",
  "BRANDING",
  "OTHERS"
]);

export async function submitContact(req, res) {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const inputServices = service;
    const rawServices = Array.isArray(inputServices)
      ? inputServices
      : inputServices
        ? [inputServices]
        : [];


    // const mappedServices = Array.from(new Set(
    //   rawServices.map(item => {
    //     if (typeof item === "string" && VALID_ENUM_VALUES.has(item)) {
    //       return item;
    //     }
    //     return "OTHERS";
    //   })
    // ));

    const newContact = await contactModel.createContact({
      name,
      email,
      phone: phone || "",
      services: rawServices,
      message,
    });

    return res.status(201).json({
      message: "Contact form submitted successfully!",
      contact: newContact,
    });
  } catch (error) {
    console.error("[contactController.submitContact] Error:", error);
    return res.status(500).json({ error: "Failed to submit contact request." });
  }
}

// Admin: Fetch all contact inquiries (optionally filtering by isResolved)
export async function getAdminContacts(req, res) {
  try {
    const { isResolved, page, limit } = req.query;
    const filter = {};

    if (isResolved !== undefined) {
      filter.isResolved = isResolved === "true";
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const { total, contacts } = await contactModel.getAllContacts(filter, pageNum, limitNum);
    return res.status(200).json({ total, contacts });
  } catch (error) {
    console.error("[contactController.getAdminContacts] Error:", error);
    return res.status(500).json({ error: "Failed to fetch contact inquiries." });
  }
}

// Admin: Mark contact inquiries as resolved or unresolved
export async function toggleResolved(req, res) {
  try {
    const { id } = req.params;
    const { isResolved } = req.body;

    if (isResolved === undefined || typeof isResolved !== "boolean") {
      return res.status(400).json({ error: "Boolean isResolved status is required." });
    }

    const updatedContact = await contactModel.resolveContact(id, isResolved);
    return res.status(200).json(updatedContact);
  } catch (error) {
    console.error("[contactController.toggleResolved] Error:", error);
    return res.status(500).json({ error: "Failed to update resolution status." });
  }
}

export async function chatAi(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." })
    }

    const reply = await contactModel.chatAi(prompt)
    return res.status(200).json({ message: reply })


  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ error: error.message })
  }
}
