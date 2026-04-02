import React, { useState, useEffect, useMemo } from 'react';
import { useMemories } from '../../hooks/useMemories';
import MemoryCard from '../components/MemoryCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Library as LibraryIcon, 
  Video, // <--- Swapped 'Youtube' for 'Video'
  FileText, 
  Image as ImageIcon, 
  LayoutGrid,
  Filter,X
} from 'lucide-react';

const Library = () => {
  const { memories, fetchHistory, isFetching } = useMemories();
  const [activeFilter, setActiveFilter] = useState('all');

  const location = useLocation();
  const navigate = useNavigate();
  const collectionData = location.state;

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredMemories = useMemo(() => {
    let result = memories;

    // Step A: Filter by Collection if we navigated from the Knowledge Map
    if (collectionData?.filterIds) {
      result = result.filter(item => collectionData.filterIds.includes(item._id));
    }

    // Step B: Filter by the visual tabs (Video, Doc, etc.)
    if (activeFilter !== 'all') {
      result = result.filter(item => item.type === activeFilter);
    }

    return result;
  }, [memories, activeFilter, collectionData]);

  const clearCollectionFilter = () => {
    // Replaces the current URL state, wiping the collection data
    navigate('/library', { replace: true }); 
  };
  
  const filters = [
    { id: 'all', label: 'All Nodes', icon: <LayoutGrid size={16} /> },
    { id: 'youtube', label: 'Videos', icon: <Video size={16} /> }, // <--- Swapped here
    { id: 'pdf', label: 'Documents', icon: <FileText size={16} /> },
    { id: 'image', label: 'Images', icon: <ImageIcon size={16} /> },
  ];

  return (
    <div className="library-page">
      <header className="library-header">
        <div className="title-group">
          <LibraryIcon className="header-icon" size={28} />
          <h1>Neural Vault</h1>
        </div>
        
        <div className="filter-bar">
          <div className="filter-label">
            <Filter size={14} />
            <span>Filter By:</span>
          </div>
          <div className="filter-pills">
            {filters.map((f) => (
              <button 
                key={f.id}
                className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="library-content">
        {isFetching ? (
          <div className="library-loading">
            <div className="loader-ring"></div>
            <p>Defragmenting memory sectors...</p>
          </div>
        ) : filteredMemories.length > 0 ? (
          <div className="memory-grid">
            {filteredMemories.map((item) => (
              <MemoryCard key={item._id} data={item} />
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <p>No <strong>{activeFilter}</strong> nodes found in this sector.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;