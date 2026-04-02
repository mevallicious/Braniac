import React, { useEffect } from 'react';
import { FolderGit2, Sparkles, Loader2, BrainCircuit, ChevronRight, Layers } from 'lucide-react';
import { useMemories } from '../../hooks/useMemories';
import { useNavigate } from 'react-router-dom';

const Collections = () => {
  const navigate = useNavigate();

  const { clusters = [], generateKnowledgeMap, isFetching, brainError } = useMemories();


  useEffect(() => {
    // Only auto-generate if we haven't mapped yet
    if (!clusters || clusters.length === 0) {
      generateKnowledgeMap();
    }
  }, []);

  const handleGenerateMap = () => {
    generateKnowledgeMap();
  };

  return (
    <div className="collections-page search-page">
      {/* HERO SECTION */}
      <div className="search-hero">
        <div className="hero-content">
          <div className="icon-box">
             <Layers size={40} className="hero-icon" />
          </div>
          <h1>Neural Collections</h1>
          <p>Your second brain, auto-organized. Braniac analyzes your memories and groups them into logical clusters.</p>
        </div>

        <div className="mapping-controls">
          <button 
            className="search-trigger btn-map" 
            onClick={handleGenerateMap} 
            disabled={isFetching}
          >
            {isFetching ? (
              <><Loader2 className="spinner" size={20} /> Analyzing Neural Pathways...</>
            ) : (
              <><Sparkles size={20} /> Re-Map My Brain</>
            )}
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {brainError && (
        <div className="search-state empty">
          <p className="error-text">{brainError}</p>
        </div>
      )}

      {/* CLUSTERS GRID */}
      <div className="results-container">
        {isFetching ? (
          <div className="search-state loading">
            <BrainCircuit className="pulse-icon" size={48} color="#6366f1" />
            <p>Braniac is reading your vault...</p>
            <span className="loading-subtext">(This takes about 5-10 seconds)</span>
          </div>
        ) : clusters?.length > 0 ? (
          <div className="clusters-grid">
            {clusters.map((cluster, index) => (
              <div key={index} className="cluster-folder">
                <div className="folder-header">
                  <div className="folder-icon-wrapper">
                    <FolderGit2 size={24} color="#6366f1" />
                  </div>
                  <span className="node-count">{cluster.memoryIds?.length || 0} Nodes</span>
                </div>
                
                <h3 className="folder-title">{cluster.topic}</h3>
                <p className="folder-desc">{cluster.description}</p>
                
                <button 
                    className="open-folder-btn"
                    onClick={() => navigate('/library', { 
                    state: { filterIds: cluster.memoryIds, topic: cluster.topic } 
                    })}
                >
                    Explore Topic <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : !isFetching && !brainError ? (
          <div className="search-state initial">
            <p>No clusters found. Save more memories or click "Map My Brain" to start.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Collections;