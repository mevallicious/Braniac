import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Image as ImageIcon, FileText, Link as LinkIcon, 
  Trash2, ExternalLink, Calendar, PlayCircle, StickyNote 
} from 'lucide-react';
import { useMemories } from '../../hooks/useMemories';

const MemoryCard = ({ data }) => {
  const navigate = useNavigate();
  const { forget } = useMemories();

  
  const mongoId = data.metadata?._id || data._id;

  const handleCardClick = () => {
    if (mongoId && !String(mongoId).startsWith('mem_')) {
      navigate(`/memory/${mongoId}`);
    } else {
      console.error("❌ Link Broken: This node is missing a MongoDB reference.", data);
      alert("This is an older 'orphan' node. Please delete and re-save it to link it to the database.");
    }
  };


  const type = data.type || data.metadata?.type || 'link';
  const fileUrl = data.fileUrl || data.metadata?.fileUrl;
  const rawContent = data.content || data.metadata?.originalContent || "";
  

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = getYoutubeId(fileUrl);
  const isYoutube = type === 'youtube' || (type === 'link' && videoId);


  const displayTitle = rawContent
    .replace(/^(Title:|Source URL:|Please analyze this URL:)\s*/i, '')
    .split('\n')[0] || 'Neural Node';

  const getIcon = (size = 18) => {
    if (isYoutube) return <Video size={size} color="#ff2e2e" />;
    switch (type) {
      case 'image': return <ImageIcon size={size} color="#10b981" />;
      case 'pdf': return <FileText size={size} color="#6366f1" />;
      case 'text': return <StickyNote size={size} color="#f8fafc" />;
      default: return <LinkIcon size={size} color="#94a3b8" />;
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Forget this memory node?")) forget(mongoId);
  };

  return (
    <div className="memory-card" onClick={handleCardClick}>
      <div className="card-media">
        {isYoutube && videoId ? (
          <div className="video-preview">
            <div className="play-overlay">
              <PlayCircle size={44} color="white" strokeWidth={1.5} />
            </div>
            <img 
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
              alt="Thumbnail" 
            />
          </div>
        ) : type === 'image' && fileUrl ? (
          <img src={fileUrl} alt="Memory" className="image-preview" />
        ) : (
          <div className={`type-placeholder ${type}`}>
            {getIcon(40)}
            <span>{type.toUpperCase()}</span>
          </div>
        )}

        <div className="card-overlay">
          <button className="action-btn delete" onClick={handleDelete} title="Forget">
            <Trash2 size={18} />
          </button>
          {fileUrl && (
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="action-btn" 
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      <div className="card-info">
        <div className="info-top">
          <span className={`type-badge ${isYoutube ? 'youtube' : type}`}>
            {getIcon(12)} 
            <span className="type-text">{isYoutube ? 'youtube' : type}</span>
          </span>
          <span className="date-badge">
            <Calendar size={12} /> 
            {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recent'}
          </span>
        </div>
        <h3 className="card-title">{displayTitle.substring(0, 65)}...</h3>
      </div>
    </div>
  );
};

export default MemoryCard;