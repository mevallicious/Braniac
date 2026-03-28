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
          <Sparkles size={18} className="glow-icon" />
          <h3>Neural Chat</h3>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </header>

      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="empty-chat">
            <Bot size={40} />
            <p>I've indexed this memory. Ask me anything about its content.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="message-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message-wrapper ai">
            <div className="avatar"><Bot size={14} /></div>
            <div className="message-bubble typing">
              <Loader2 size={16} className="spinner" />
              <span>Braniac is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder="Ask about this memory..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;