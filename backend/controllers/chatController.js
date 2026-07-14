const nodemailer = require("nodemailer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const getEmailHTML = require("../emailTemplate");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TINA_SYSTEM_INSTRUCTION = `You are Tina, an empathetic and professional digital insurance consultant for Turners Car New Zealand.
Your goal is to guide the user through a natural conversation to discover their needs and recommend the perfect vehicle insurance policy.

CONVERSATION FLOW:
1. Always start the conversation EXACTLY with this introduction and opt-in question: I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?
2. If the user says "No" or disagrees, politely inform them that you cannot provide a tailored recommendation without context, and stop asking questions.
3. If the user agrees, ask a series of questions ONE BY ONE to uncover the details about their vehicle and coverage needs. Do not dump all questions at once.
4. CRITICAL RULE: Never ask the user directly "What insurance product do you want". Instead, uncover context naturally.

AVAILABLE INSURANCE PRODUCTS:
1. Mechanical Breakdown Insurance (MBI): Covers mechanical and electrical failures.
2. Comprehensive Car Insurance: Covers accidental damage to your car, fire, theft, and damage you cause to others.
3. Third Party Car Insurance: Covers damage you cause to OTHER people's property.

STRICT BUSINESS RULES:
1. Mechanical Breakdown Insurance (MBI) is strictly not available to trucks or racing cars.
2. Comprehensive Car Insurance is ONLY available to motor vehicles that are less than 10 years old.

INDICATIVE PRICING (for illustration only, NOT a real quote):
Use these rough NZD/month bands as a guide, adjusting slightly within the band based on vehicle age/value where sensible. If recommending more than one product together, sum their bands.
- Third Party Car Insurance: $15-$25/month
- Mechanical Breakdown Insurance (MBI): $25-$50/month
- Comprehensive Car Insurance: $45-$90/month (newer/higher-value vehicles trend toward the top of the range)

CONCLUSION ROUTINE:
Once you have collected enough information (typically after 3-4 responses), you MUST generate a final recommendation block exactly using these labels:
CUSTOMER: [Customer Name]
VEHICLE: [Year Make Model]
POLICY: [Basic, Comprehensive, Premium]
COVERAGE: [Summary]
WHY: [Justification]
ESTIMATED_PRICE: [Indicative NZD/month range from the bands above. ALWAYS include this exact sentence immediately after the figure: "This is a ballpark estimate only, not a binding quote - your real price depends on your full driving history and details."]
NEXT_STEPS: [Action track via turners.co.nz]`;

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  systemInstruction: TINA_SYSTEM_INSTRUCTION,
});

const fallbackModel = genAI.getGenerativeModel({
  model: "gemini-3.5-flash",
  systemInstruction: TINA_SYSTEM_INSTRUCTION,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const REQUEST_TIMEOUT_MS = 8000;

async function generateWithRetry(genModel, payload, maxRetries = 1) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await genModel.generateContent(payload, {
        timeout: REQUEST_TIMEOUT_MS,
      });
    } catch (err) {
      lastErr = err;
      const isOverloaded = err?.status === 503;
      if (!isOverloaded || attempt === maxRetries) throw err;
      await sleep(400 * 2 ** attempt);
    }
  }
  throw lastErr;
}

async function generateContentWithRetry(payload) {
  try {
    return await generateWithRetry(model, payload);
  } catch (err) {
    if (err?.status !== 503) throw err;
    console.warn("Primary model overloaded, falling back to gemini-2.5-flash");
    return await generateWithRetry(fallbackModel, payload, 0);
  }
}

exports.handleChat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid request format. Expected messages array." });
  }

  try {
    let conversationText = "";

    const cleanHistory = messages
      .map((msg) => {
        const textPayload = (msg.text || msg.content || "").trim();
        if (!textPayload) return null;

        conversationText += textPayload.toLowerCase() + " ";

        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: String(textPayload) }],
        };
      })
      .filter(Boolean);

    const result = await generateContentWithRetry({ contents: cleanHistory });

    let aiResponseText =
      result?.response?.text()?.trim() ||
      "Sorry, I couldn't generate a response.";

    const isTruckOrRacer =
      conversationText.includes("truck") ||
      conversationText.includes("racer") ||
      conversationText.includes("racing");

    const yearMatch = conversationText.match(/\b(19\d{2}|20\d{2})\b/);
    const currentYear = new Date().getFullYear();
    const isOlderThan10Years = yearMatch
      ? currentYear - parseInt(yearMatch[0], 10) > 10
      : false;

    if (
      isTruckOrRacer &&
      aiResponseText.toLowerCase().includes("mechanical breakdown insurance")
    ) {
      aiResponseText =
        "I've noted that you have a truck/racing vehicle. Please note that Mechanical Breakdown Insurance isn't available for these types, but I can certainly help you with our other coverage options!";
    }

    if (
      isOlderThan10Years &&
      aiResponseText.toLowerCase().includes("comprehensive car insurance")
    ) {
      aiResponseText = aiResponseText.replace(
        /Comprehensive Car Insurance/gi,
        "Third Party Car Insurance (Note: Comprehensive is unavailable for vehicles over 10 years old)",
      );
    }

    res.json({ reply: aiResponseText.trim() });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({
      error:
        "Tina is handling a high volume of requests right now. Please try again!",
    });
  }
};

exports.checkHealth = (req, res) => {
  res.status(200).json({ status: "ok" });
};

exports.handleSendSummary = async (req, res) => {
  const { email, summary } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !summary || !emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "A valid email and summary are required." });
  }

  try {
    await transporter.sendMail({
      from: `"Tina from Turners" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Turners Insurance Summary",
      html: getEmailHTML(summary),
    });

    res.json({ success: true, message: "Summary emailed successfully." });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ error: "Failed to send summary email." });
  }
};
