import { useContext, useCallback } from 'react';
import { BrainContext } from '../state/BrainContext';
// 🚨 Direct imports from your individual API exports
import {getHistory, saveLink, searchMemories, uploadFile, deleteMemory ,saveNote } from '../api/brain.api';

export const useMemories = () => {
    const { 
        memories, setMemories, 
        searchResults, setSearchResults,
        isFetching, setIsFetching, 
        setBrainError 
    } = useContext(BrainContext);


    const fetchHistory = useCallback(async () => {
        setIsFetching(true);
        try {
        const data = await getHistory();
        setMemories(data.history);
        } catch (err) {
        setBrainError("Braniac couldn't retrieve your memories.");
        } finally {
        setIsFetching(false);
        }
    }, [setMemories, setIsFetching, setBrainError]);


    const archiveLink = async (url) => {
        setIsFetching(true);
        try {
            const result = await saveLink(url);
            setMemories((prev) => [result.data, ...prev]);
            return result;
        } catch (err) {
            setBrainError("Failed to bookmark that link.");
            throw err;
        } finally {
            setIsFetching(false);
        }
    };

    const archiveFile = async (file) => {
        setIsFetching(true);
        try {
            const result = await uploadFile(file);
            setMemories((prev) => [result.data, ...prev]);
            return result;
        } catch (err) {
            setBrainError("Braniac failed to process that file.");
            throw err;
        } finally {
            setIsFetching(false);
        }
    };

    
    const search = async (query) => {
        if (!query.trim()) {
        setSearchResults([]);
        return;
        }
        setIsFetching(true);
        try {
        const data = await searchMemories(query);
        setSearchResults(data.results);
        } catch (err) {
        setBrainError("Search failed to connect.");
        } finally {
        setIsFetching(false);
        }
    };

    
    const forget = async (id) => {
        try {
        await deleteMemory(id);
        // Immediately remove from local state so the UI updates instantly
        setMemories((prev) => prev.filter(m => m._id !== id));
        setSearchResults((prev) => prev.filter(m => m._id !== id));
        } catch (err) {
        setBrainError("Deletion failed.");
        }
    };

    const archiveNote = async (text) => {
        setIsFetching(true);
        try {
            const result = await saveNote(text);
            setMemories((prev) => [result.data, ...prev]);
            return result;
        } catch (err) {
            setBrainError("The Void is full. Could not save your thought.");
            throw err;
        } finally {
            setIsFetching(false);
        }
    };

    return { 
        memories, 
        searchResults, 
        isFetching, 
        fetchHistory, 
        archiveLink, 
        archiveFile, 
        search, 
        forget,
        archiveNote
    };
};