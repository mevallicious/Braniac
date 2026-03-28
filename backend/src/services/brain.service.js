import { model, generateMetadata, getEmbedding } from '../config/gemini.js';
import { pineconeIndex } from '../config/pinecone.js';
import { Memory } from '../models/memory.model.js';
import { Chat } from "../models/chat.model.js";

/**
 * Saves memory to MongoDB and a private Pinecone namespace
 */
export const processAndArchive = async (content, type, userId, fileUrl = null) => {
  try {
    // 1. Content Guard: Never let the AI see an empty string
    const safeContent = (content && content.trim().length > 0) 
      ? content 
      : `Shared ${type} bookmark: ${fileUrl || "No text extracted"}`;

    console.log(`🧠 Braniac: Processing ${type}...`);

    // 2. AI Analysis
    const metadata = await generateMetadata(safeContent);
    const vector = await getEmbedding(safeContent);

   
    if (!vector || !Array.isArray(vector) || vector.length === 0) {
      throw new Error("Gemini failed to generate an embedding. Vector is empty.");
    }

    const pineconeId = `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    
    const newMemory = await Memory.create({
      userId,
      content: safeContent,
      summary: metadata?.summary || "No summary available",
      tags: metadata?.tags || ["unsorted"],
      type,
      pineconeId,
      fileUrl
    });

    
    const record = {
      id: String(pineconeId),
      values: Array.from(vector),
      metadata: {
        _id: String(newMemory._id),
        userId: String(userId),
        type: String(type || "link"),
        summary: metadata?.summary ? String(metadata.summary).substring(0, 500) : "No summary",
        originalContent: String(safeContent).substring(0, 1000)
      }
    };

    
    if (record.values.length !== 768) {
      throw new Error(`Dimension mismatch! Gemini gave us ${record.values.length} dimensions, but Pinecone expects 768.`);
    }

    
    await pineconeIndex.namespace(String(userId)).upsert({
        records: [record] 
      }); 

    console.log(`✅ Success: Memory ${pineconeId} is now in the vault.`);
    return newMemory;

  } catch (error) {
    console.error("❌ Archiving Error:", error.message);
    throw error; 
  }
};

/**
 * Searches only within the User's private namespace
 */
export const searchMemories = async (query, userId) => {
  try {
    console.log(`🔎 Braniac: Searching private vault for "${query}"...`);

    const queryVector = await getEmbedding(query);

    const searchResponse = await pineconeIndex.namespace(String(userId)).query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
      filter: { userId: { $eq: userId } }
    });

    return searchResponse.matches.map(match => ({
      score: match.score,
      id: match.id,
      _id: match.metadata?._id, 
      metadata: match.metadata,
      content: match.metadata?.originalContent || "Content missing",
      summary: match.metadata?.summary || "",
      type: match.metadata?.type || "unknown",
    }));

  } catch (error) {
    console.error("❌ Search Service Error:", error.message);
    throw new Error(`Braniac couldn't find anything: ${error.message}`);
  }
};

/**
 * forgetMemory: Deletes a memory from BOTH MongoDB and Pinecone.
 */
export const forgetMemory = async (mongoId, userId) => {
  try {
    const memory = await Memory.findOne({ _id: mongoId, userId });

    if (!memory) throw new Error("Memory not found or unauthorized.");

    const { pineconeId } = memory;

    if (pineconeId) {
      console.log(`🗑️ Removing vector ${pineconeId} from namespace: ${userId}...`);
      try {
        await pineconeIndex.namespace(String(userId)).deleteOne(pineconeId);
      } catch (pcError) {
        console.warn("⚠️ Pinecone deletion skipped:", pcError.message);
      }
    }

    console.log(`🗑️ Removing record ${mongoId} from MongoDB...`);
    await Memory.findByIdAndDelete(mongoId);

    return true;
  } catch (error) {
    console.error("❌ Forget Service Error:", error.message);
    throw error;
  }
};

/**
 * Chat using specific memory context + RAG search
 */
export const chatWithBrain = async (query, userId, memoryId = null) => {
  try {
    let primaryContext = "";
    
    if (memoryId) {
      const memory = await Memory.findOne({ _id: memoryId, userId });
      if (memory) {
        primaryContext = `PRIMARY MEMORY YOU ARE LOOKING AT:\nType: ${memory.type}\nContent: ${memory.content}\n\n`;
      }
    }

    const related = await searchMemories(query, userId);
    const relatedContext = related
      .map(m => `Related Content: ${m.content}`)
      .join("\n\n");

    const history = await Chat.find({ userId }).sort({ createdAt: -1 }).limit(5);
    const formattedHistory = history.reverse().map(h => `${h.role}: ${h.message}`).join("\n");

    const prompt = `
      You are "Braniac", a personal AI second brain. 
      Use the following context to answer the user's question accurately.
      
      ${primaryContext}
      
      OTHER RELEVANT KNOWLEDGE:
      ${relatedContext}
      
      RECENT CONVERSATION:
      ${formattedHistory}
      
      USER QUESTION:
      "${query}"
      
      Response Guideline: Be concise, intelligent, and reference the specific context if needed.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    await Chat.create([
      { userId, role: 'user', message: query },
      { userId, role: 'model', message: aiResponse }
    ]);

    return aiResponse;
  } catch (error) {
    console.error("❌ Chat Service Error:", error.message);
    throw error;
  }
};