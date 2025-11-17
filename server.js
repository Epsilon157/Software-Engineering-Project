// server.js
// Express server: summarize text or PDF and return downloadable summary (PDF or TXT)

import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
import PDFDocument from "pdfkit";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!OPENAI_API_KEY) {
  console.error("❌ Set your OPENAI_API_KEY environment variable before running.");
  process.exit(1);
}

const upload = multer({ dest: "uploads/" });

function createPrompt(text, opts = {}) {
  const lengthMap = { short: "2-3 sentences", medium: "4-6 sentences", long: "1-2 paragraphs" };
  const lengthDesc = lengthMap[opts.length] || lengthMap.medium;
  const style = opts.style ? ` in a ${opts.style} tone` : "";
  return `Summarize the following text into ${lengthDesc}${style}. Keep it focused, accurate, and preserve important facts.

Text:
---START---
${text}
---END---`;
}

async function summarizeText(text, opts = {}) {
  const prompt = createPrompt(text, opts);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes documents accurately." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "(No summary generated)";
}

app.post("/summarize", async (req, res) => {
  try {
    const { text, format = "json" } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text field." });

    const summary = await summarizeText(text, { length: "medium" });

    if (format === "txt") {
      const filename = `summary-${Date.now()}.txt`;
      fs.writeFileSync(filename, summary);
      res.download(filename, () => fs.unlinkSync(filename));
    } else if (format === "pdf") {
      const filename = `summary-${Date.now()}.pdf`;
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filename);
      doc.pipe(stream);
      doc.fontSize(14).text("Summary", { align: "center", underline: true });
      doc.moveDown();
      doc.fontSize(12).text(summary, { align: "left" });
      doc.end();
      stream.on("finish", () => res.download(filename, () => fs.unlinkSync(filename)));
    } else {
      res.json({ summary });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/summarize-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded." });

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    fs.unlinkSync(req.file.path);

    const text = pdfData.text.trim().slice(0, 10000);
    if (!text) return res.status(400).json({ error: "Could not extract readable text." });

    const summary = await summarizeText(text, { length: "medium" });

    const format = req.query.format || "pdf";
    const filename = `summary-${Date.now()}.${format}`;

    if (format === "txt") {
      fs.writeFileSync(filename, summary);
      res.download(filename, () => fs.unlinkSync(filename));
    } else {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filename);
      doc.pipe(stream);
      doc.fontSize(14).text("Summary of Uploaded PDF", { align: "center", underline: true });
      doc.moveDown();
      doc.fontSize(12).text(summary, { align: "left" });
      doc.end();

      stream.on("finish", () => res.download(filename, () => fs.unlinkSync(filename)));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
