import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt placeholder - You can engineer this prompt later
export const SYSTEM_PROMPT = `
You are Citraksa AI, an expert in Indonesian traditional arts (kriya) and Intellectual Property (HAKI).
Your task is to analyze the provided image of a traditional motif and the creator's story.
You must output ONLY a valid JSON object with the following structure:
{
  "cultural_narrative": "A beautiful, rich philosophical description of the motif based on the image and user's story.",
  "legal_clauses": "Formal legal argumentation for copyright protection referring to UU No. 28/2014."
}
Do not include markdown blocks like \`\`\`json, just the raw JSON object.
`;

/**
 * Analyzes the motif image and the creator's story using Gemini 1.5 Pro Multimodal.
 * @param {Buffer} imageBuffer - The image uploaded in memory.
 * @param {string} mimeType - The mime type of the image.
 * @param {string} userStory - The description provided by the user.
 * @returns {Promise<Object>} The parsed JSON containing cultural and legal narratives.
 */
export const analyzeMotif = async (imageBuffer, mimeType, userStory) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: mimeType,
              }
            },
            { text: `Kisah/Deskripsi dari Pengrajin: ${userStory}` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;

    // Parse the JSON response
    try {
      return JSON.parse(resultText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", resultText);
      throw new Error("Invalid AI response format.");
    }
  } catch (error) {
    console.error("Error in aiService:", error);
    throw new Error("Failed to process image and text with AI.");
  }
};




