import axios from 'axios';
import * as cheerio from 'cheerio';

export const getLinkMetadata = async (url) => {
  let scrapeUrl = url;
  let detectedType = "link";

  try {
    // 1. PLATFORM DETECTION & FIXERS
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      detectedType = "youtube";
    } else if (url.includes('spotify.com')) {
      detectedType = "audio";
    } else if (url.includes('instagram.com')) {
      detectedType = "image"; // Instagram links are usually visual
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      detectedType = "tweet";
      // ✅ THE X-FIX: Replace x.com with vxtwitter.com to get metadata without a login
      scrapeUrl = url.replace(/twitter\.com|x\.com/, 'vxtwitter.com');
    }

    const { data } = await axios.get(scrapeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 7000
    });

    const $ = cheerio.load(data);

    // 2. MULTI-TAG EXTRACTION (Spotify/YouTube use og: tags heavily)
    const title = 
      $('meta[property="og:title"]').attr('content') || 
      $('meta[name="twitter:title"]').attr('content') || 
      $('title').text() || 
      "";

    const description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="twitter:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      "";

    // Spotify Specific: Get Artist name if title is just the song
    let cleanTitle = title.trim();
    if (detectedType === "audio" && !cleanTitle.includes('-')) {
      const artist = $('meta[property="og:audio:artist"]').attr('content');
      if (artist) cleanTitle = `${cleanTitle} - ${artist}`;
    }

    console.log(`🔗 Scraper Found: [${detectedType}] ${cleanTitle}`);

    return { 
      title: cleanTitle, 
      description: description.trim(), 
      type: detectedType 
    };

  } catch (error) {
    console.warn(`⚠️ Scraper failed for ${url}: ${error.message}`);
    // If it fails, return empty so AI can infer it from the URL string
    return { title: "", description: "", type: detectedType };
  }
};