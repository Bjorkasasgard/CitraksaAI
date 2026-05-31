import express from 'express';
import multer from 'multer';
import { analyzeMotifController, generatePdfController } from '../controllers/documentController.js';

const router = express.Router();

// Configure multer for memory storage (stateless)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route for AI Analysis (Image + Text)
router.post('/analyze-motif', upload.single('image'), analyzeMotifController);

// Route for PDF Generation (Text + Image)
router.post('/generate-pdf', upload.single('image'), generatePdfController);

export default router;
