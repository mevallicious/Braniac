import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ExternalLink, Video, 
  Image as ImageIcon, FileText, StickyNote, Info, Sparkles, PlayCircle
} from 'lucide-react';
import { useMemories } from '../../hooks/useMemories';
import ChatPanel from '../components/ChatPanel';

const MemoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memories, searchResults } = useMemories();
  const [item, setItem] = useState(null);

  useEffect(() => {
    let found = memories?.find(m => String(m._id) === String(id));
    if (!found && searchResults?.length > 0) {
      found = searchResults.find(m => String(m._id) === String(id));
    }
    if (found) setItem(found);
  }, [id, memories, searchResults]);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  if (!item) return (
    <div className="detail-loading">
      <div className="brain-pulse"></div>
      <p>Reconstructing Neural Data...</p>
    </div>
  );

  const fileUrl = item.fileUrl || item.metadata?.fileUrl;
  const type = item.type || item.metadata?.type || 'link';
  const rawContent = item.content || item.metadata?.originalContent || "";
  const suggestions = item.metadata?.suggestions || []; // 🎯 Grab suggestions from metadata

  const videoId = getYoutubeId(fileUrl);
  const isYoutube = type === 'youtube' || (type === 'link' && videoId);
  const displayTitle = rawContent.replace(/^(Title:|Source URL:|Please analyze this URL:)\s*/i, '') || 'Neural Node';

  const getIcon = (size = 18) => {
    if (isYoutube) return <Video size={size} color="#ff2e2e" />;
    switch (type) {
      case 'image': return <ImageIcon size={size} color="#10b981" />;
      case 'pdf': return <FileText size={size} color="#6366f1" />;
      case 'text': return <StickyNote size={size} color="#f8fafc" />;
      default: return <Info size={size} color="#94a3b8" />;
    }
  };

  return (
    <div className="memory-detail-layout">
      <div className="viewer-section">
        <header className="viewer-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ChevronLeft size={18} /> <span>Back</span>
          </button>
          <div className="header-actions">
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="action-link">
                Source Document <ExternalLink size={14} />
              </a>
            )}
          </div>
        </header>

        <div className="main-display">
          {isYoutube && videoId ? (
            <div className="video-viewport">
              <iframe 
                src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&modestbranding=1`} 
                title="YouTube Player"
                allowFullScreen
              />
            </div>
          ) : type === 'image' ? (
            <div className="image-viewport">
              <img src={fileUrl} alt="Memory Visual" />
            </div>
          ) : (
            <div className={`document-viewport ${type}`}>
              <div className="doc-glass">
                <div className="doc-header">
                  {getIcon(32)}
                  <div className="doc-title-group">
                    <h2>{type === 'text' ? "Personal Thought" : "Neural Synthesis"}</h2>
                    <p>Node Hash: {String(item._id || item.id).substring(0, 12)}</p>
                  </div>
                </div>
                <div className="doc-content-scroll">{displayTitle}</div>
              </div>
            </div>
          )}
        </div>

        <footer className="viewer-footer">
          <div className="meta-info">
            <div className="badge-row">
                <span className={`type-tag ${isYoutube ? 'youtube' : type}`}>
                    {getIcon(14)}
                    {(isYoutube ? 'youtube' : type).toUpperCase()}
                </span>
                <span className="timestamp">Accessed Neural Node</span>
            </div>
            <h1 className="detail-title">{displayTitle.split('\n')[0]}</h1>
            <div className="tag-list">
              {(item.tags || item.metadata?.tags || []).map((tag, i) => (
                <span key={i} className="detail-tag">#{tag}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>

      <div className="chat-section">
        
        {/* TOP HALF: RECOMMENDATIONS */}
        <div className="recommendations-area">
          <div className="rec-header">
            <Sparkles size={16} color="#ff2e2e" />
            <span>Similar Recommendations</span>
          </div>
          
          <div className="rec-list">
            {suggestions.length > 0 ? (
              suggestions.map((s, idx) => (
                <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="rec-card">
                  <div className="rec-thumb">
                    <img src={s.thumbnail} alt={s.title} />
                    <div className="play-overlay"><PlayCircle size={20} /></div>
                  </div>
                  <div className="rec-info">
                    <span className="rec-type">{s.type === 'same_channel' ? 'From Channel' : 'Related Topic'}</span>
                    <p className="rec-title">{s.title}</p>
                  </div>
                </a>
              ))
            ) : (
              <div className="rec-empty">
                <p>Analyzing node for similar videos.</p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM HALF: CHAT */}
        <div className="chat-area">
          <ChatPanel memoryId={id} title={displayTitle} />
        </div>
      </div>
    </div>
  );
};

export default MemoryDetail;