import { useState } from 'react';
import { chatWithMemory } from '../api/brain.api';

export const useChat = (memoryId) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        
        setIsTyping(true);
        setError(null);

        try {
        const data = await chatWithMemory(memoryId, text);
        
        
        const aiMsg = { role: 'ai', content: data.response, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
        setError("Braniac is having trouble connecting to this memory.");
        console.error("Chat Error:", err);
        } finally {
        setIsTyping(false);
        }
    };

    return { messages, sendMessage, isTyping, error };
};