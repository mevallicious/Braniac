import { processAndArchive, searchMemories, chatWithBrain ,forgetMemory } from '../services/brain.service.js';
import imagekit from '../utils/imagekit.js';
import { parseFile } from '../utils/fileParser.js';
import { Memory } from '../models/memory.model.js';
import { getLinkMetadata } from '../utils/urlParser.js';
import { generateClusters } from '../services/brain.service.js'; 

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded." });

        const userId = req.user.id;

        // 1. UPLOAD TO IMAGEKIT
        const ikResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: `braniac_${Date.now()}_${req.file.originalname}`,
            folder: `/braniac/user_${userId}`
        });

        const fileUrl = ikResponse.url;

        const extractedText = await parseFile(req.file.buffer, req.file.mimetype);

        const aiResult = await processAndArchive(
            extractedText || "Unnamed Document Node", 
            req.file.mimetype.includes('image') ? 'image' : 'pdf', 
            userId, 
            fileUrl
        );

        res.status(200).json({
            message: "File stored and indexed!",
            fileUrl: fileUrl, 
            aiSummary: aiResult?.summary || "Analysis pending...", 
            data: aiResult
        });

    } catch (error) {
        console.error("❌ UPLOAD PROCESS CRASHED:", error); 
        res.status(500).json({ 
            error: "Upload failed", 
            details: error.message 
        });
    }
};

/**
 * POST /api/v1/brain/save
 */
export const saveContent = async (req, res) => {
  const { content, type } = req.body;
  const userId = req.user.id; 

  if (!content || !type) {
    return res.status(400).json({ error: "Missing content or type." });
  }

  try {
    const result = await processAndArchive(content, type, userId);
    res.status(200).json({
      message: "Braniac saved it to your private vault!",
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: "Save failed", details: error.message });
  }
};

/**
 * GET /api/v1/brain/search?q=query
 */
export const searchContent = async (req, res) => {
  const { q } = req.query;
  const userId = req.user.id;

  if (!q) {
    return res.status(400).json({ error: "Provide a search query (q)." });
  }

  try {
    const results = await searchMemories(q, userId);
    res.status(200).json({
      message: `Braniac found ${results.length} relevant memories.`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};

/**
 * POST /api/brain/chat/:id
 */
export const brainChat = async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ error: "You gotta say something, bro!" });
  }

  try {
    const response = await chatWithBrain(message, userId, id); 
    
    res.status(200).json({ response });
  } catch (error) {
    console.error("❌ Chat Controller Error:", error.message);
    res.status(500).json({ error: "Chat failed", details: error.message });
  }
};



/**
 * GET /api/v1/brain/history
 * Fetches all memories for the logged-in user from MongoDB
 */
export const getHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    
    const history = await Memory.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "History fetched successfully",
      count: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history", details: error.message });
  }
};

/**
 * DELETE /api/v1/brain/:id
 */
export const deleteMemory = async (req, res) => {
  const { id } = req.params; // The MongoDB ID from the URL
  const userId = req.user.id;

  try {
    await forgetMemory(id, userId);

    res.status(200).json({
      message: "Braniac has officially forgotten that memory."
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Deletion failed.", 
      details: error.message 
    });
  }
};

/**
 * POST /api/v1/brain/save-link
 */
export const saveLink = async (req, res) => {
  const { url } = req.body;
  const userId = req.user.id;

  try {
    // 1. Scrape metadata using your updated urlParser
    const metadata = await getLinkMetadata(url);
    
    // 2. Format content for Gemini
    // We prioritize the Title + Description for better AI indexing
    const contentToArchive = metadata.title 
      ? `Title: ${metadata.title}\nDescription: ${metadata.description}`
      : `Source URL: ${url}`;

    // 3. INDEX IT
    const result = await processAndArchive(
      contentToArchive, 
      metadata.type || "link", //  FIX: Use the type from scraper (youtube, tweet, audio, etc.)
      userId, 
      url 
    );

    res.status(200).json({ 
      message: "Braniac indexed the link successfully!", 
      data: result 
    });

  } catch (error) {
    console.error("❌ Link Save Failed:", error.message);
    res.status(500).json({ error: "Could not save link", details: error.message });
  }
};


/**
 * GET /api/v1/brain/clusters
 */
export const getKnowledgeMap = async (req, res) => {
  const userId = req.user.id;

  try {
    const clusters = await generateClusters(userId);
    
    res.status(200).json({
      message: "Knowledge map generated.",
      clusters
    });
  } catch (error) {
    res.status(500).json({ error: "Mapping failed", details: error.message });
  }
};