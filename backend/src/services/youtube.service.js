import axios from "axios"

export const getSmartSuggestions = async (videoId) => {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    try {
        // 1. Get the original video details to find the Channel ID and Title
        const detailsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: { part: 'snippet', id: videoId, key: API_KEY }
        });

        const video = detailsRes.data.items[0];
        if (!video) return [];

        const { channelId, title, tags } = video.snippet;
        const mainTopic = tags ? tags[0] : title.split(' ')[0];

        // 2. Fetch 1 more from the SAME channel
        const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { 
                part: 'snippet', 
                channelId: channelId, 
                maxResults: 1, 
                type: 'video', 
                order: 'date',
                key: API_KEY 
            }
        });

        // 3. Fetch 1 from the SAME topic (different channel)
        const topicRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { 
                part: 'snippet', 
                q: `${mainTopic} tutorial`, 
                maxResults: 1, 
                type: 'video', 
                key: API_KEY 
            }
        });

        // 🎯 Package them neatly
        return [
            {
                type: 'same_channel',
                title: channelRes.data.items[0]?.snippet.title,
                url: `https://www.youtube.com/watch?v=${channelRes.data.items[0]?.id.videoId}`,
                thumbnail: channelRes.data.items[0]?.snippet.thumbnails.high.url
            },
            {
                type: 'related_topic',
                title: topicRes.data.items[0]?.snippet.title,
                url: `https://www.youtube.com/watch?v=${topicRes.data.items[0]?.id.videoId}`,
                thumbnail: topicRes.data.items[0]?.snippet.thumbnails.high.url
            }
        ];
    } catch (err) {
        console.error("YouTube Engine Error:", err);
        return [];
    }
};
