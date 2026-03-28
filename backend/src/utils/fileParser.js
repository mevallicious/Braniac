import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 🚨 We use require here because pdf-parse doesn't support 'import'
const pdf = require('pdf-parse-debugging-disabled');

import { model } from '../config/gemini.js';

export const parseFile = async (fileBuffer, mimeType) => {
  // --- HANDLE PDFs ---
  if (mimeType === 'application/pdf') {
    try {
      // Now 'pdf' will be recognized as a function!
      const data = await pdf(fileBuffer);
      return data.text;
    } catch (error) {
      console.error("PDF Parsing Error:", error.message);
      throw new Error("Braniac couldn't read this PDF. Is it password protected?");
    }
  } 

 
  if (mimeType === 'text/plain') {
    return fileBuffer.toString('utf-8');
  }

  if (mimeType.startsWith('image/')) {
  try {
    const imagePart = {
      inlineData: { data: fileBuffer.toString("base64"), mimeType }
    };
    
    const prompt = "Transcribe all text in this image. If no text, describe it in detail.";
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    
    return text && text.trim().length > 0 ? text : "A visual memory with no extractable text.";

  } catch (error) {
    console.error("Gemini Vision Error:", error.message);
    return "An image file that Braniac couldn't fully process.";
  }
}

  throw new Error("Braniac doesn't support this file type yet.");
};