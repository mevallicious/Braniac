import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

const ChatPanel = ({ memoryId, onClose }) => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isTyping } = useChat(memoryId);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div className="header-info">
          <Sparkles size={16} className="glow-icon" />
          <h3>Neural Link</h3>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        )}
      </header>

      <div className="chat-messages" ref={scrollRef}>
        
        {/* 🧠 THE BRAINY GREETING (Always First) */}
        <div className="message-wrapper ai greeting">
          <div className="avatar"><Bot size={12} /></div>
          <div className="message-bubble">
            Hey! I'm <strong>Brainy</strong>. 🧠 I've indexed this node into your vault. If you have any questions related to the file, just ask me!
          </div>
        </div>

        {/* REAL CONVERSATION HISTORY */}
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div className="message-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {/* TYPING INDICATOR */}
        {isTyping && (
          <div className="message-wrapper ai">
            <div className="avatar"><Bot size={12} /></div>
            <div className="message-bubble typing">
              <Loader2 size={14} className="spinner" />
              <span>Brainy is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder="Ask Brainy something..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;