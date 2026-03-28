import React, { useState } from 'react';
import { Link2, FileUp, Plus, Loader2 } from 'lucide-react';
import { useMemories } from '../../hooks/useMemories';

const QuickSave = () => {
  const [input, setInput] = useState('');
  const { archiveLink, archiveFile, isFetching } = useMemories();

  const handlePaste = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      await archiveLink(input);
      setInput('');
    } catch (err) {
      alert("Failed to archive link. Check the console.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await archiveFile(file);
        e.target.value = null; 
      } catch (err) {
        console.error("Upload UI Error:", err);
        alert("Neural sync failed. Check your server connection.");
      }
    }
  };

  return (
    <div className="quicksave-container">
      <form className="input-wrapper" onSubmit={handlePaste}>
        <Link2 className="input-icon" size={20} />
        <input 
          type="text" 
          placeholder="Paste a YouTube link, Tweet, or Website URL..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isFetching}
        />
        <button type="submit" className="add-btn" disabled={!input.trim() || isFetching}>
          {isFetching ? <Loader2 className="spinner" size={18} /> : <Plus size={20} />}
          <span>Add</span>
        </button>
      </form>

      <div className="divider">OR</div>

      <label className="file-upload-label">
        <input type="file" onChange={handleFileUpload} hidden disabled={isFetching} />
        <FileUp size={18} />
        <span>Upload PDF or Image</span>
      </label>
    </div>
  );
};

export default QuickSave;