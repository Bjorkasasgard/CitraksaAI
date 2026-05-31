import { analyzeMotif } from '../services/aiService.js';
import { generateHakiDocument } from '../services/pdfService.js';

export const analyzeMotifController = async (req, res) => {
  try {
    const file = req.file;
    const { story } = req.body;

    if (!file) {
      return res.status(400).json({ error: "Image file is required." });
    }

    if (!story) {
      return res.status(400).json({ error: "Story description is required." });
    }

    // 1. Analyze motif with Gemini (Multimodal)
    const aiResult = await analyzeMotif(file.buffer, file.mimetype, story);

    // 2. Return JSON response
    res.json(aiResult);
  } catch (error) {
    console.error("Error in analyzeMotif controller:", error);
    res.status(500).json({ error: "Internal server error during motif analysis." });
  }
};

export const generatePdfController = async (req, res) => {
  try {
    const file = req.file;
    const { fullName, nik, address, culturalNarrative, legalClauses } = req.body;

    const pdfData = {
      fullName: fullName || "Tidak diisi",
      nik: nik || "Tidak diisi",
      address: address || "Tidak diisi",
      culturalNarrative: culturalNarrative || "",
      legalClauses: legalClauses || "",
      imageBuffer: file ? file.buffer : null,
      mimeType: file ? file.mimetype : null,
    };

    // 1. Generate PDF Document
    const pdfBuffer = await generateHakiDocument(pdfData);

    // 2. Send back PDF as a stream/buffer
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Dokumen_HAKI_Citraksa.pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Convert Uint8Array to Node Buffer and send
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error("Error in generatePdf controller:", error);
    res.status(500).json({ error: "Internal server error during PDF generation." });
  }
};
