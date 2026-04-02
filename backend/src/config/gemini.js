import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ 
  model: "gemini-flash-lite-latest" 
});

export const embeddingModel = genAI.getGenerativeModel({ 
  model: "gemini-embedding-2-preview" 
});

/**
 * generateMetadata
 * Uses the Flash model to turn raw text into a structured JSON summary and tags.
 */
export const generateMetadata = async (content) => {
  try {
    const prompt = `
      Analyze the content below and return a JSON object.
      Content: "${content}"
      
      Structure:
      {
        "summary": "2-sentence overview",
        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
      }
      
      Return ONLY the JSON. No preamble.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    

    const jsonString = response.match(/\{[\s\S]*\}/)[0];
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("❌ Metadata Generation Error:", error);
    throw new Error("AI failed to generate tags.");
  }
};

/**
 * getEmbedding
 * Turns text into a 768-dimension vector.
 * We force 'outputDimensionality: 768' to match your Pinecone index.
 */
export const getEmbedding = async (text) => {
  try {
    const result = await embeddingModel.embedContent({
      content: { parts: [{ text }] },
      taskType: TaskType.RETRIEVAL_DOCUMENT, // Optimized for storing in a DB
      outputDimensionality: 768,             // FORCES IT TO 768 DIMENSIONS
    });

    const vector = result.embedding.values;

    if (vector.length !== 768) {
      console.warn(`⚠️ Vector length is ${vector.length}, expected 768.`);
    }

    return vector;
  } catch (error) {
    console.error("❌ Embedding Error:", error);
    throw new Error("Failed to create memory vector.");
  }
};