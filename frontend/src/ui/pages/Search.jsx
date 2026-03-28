import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Sparkles, BrainCircuit, Activity } from 'lucide-react';
import { useMemories } from "../../hooks/useMemories";
import MemoryCard from '../components/MemoryCard';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const { search, searchResults, isFetching } = useMemories();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    search(query);
  };

  return (
    <div className="search-page">
      <div className="search-hero">
        <div className="hero-content">
          <div className="icon-box">
             <BrainCircuit size={40} className="hero-icon" />
          </div>
          <h1>Neural Search</h1>
          <p>Ask your second brain anything. Braniac searches by meaning, not just keywords.</p>
        </div>

        <form className="search-interface" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" size={22} />
            <input 
              type="text" 
              placeholder="e.g., 'What did I save about machine learning?'" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="search-trigger" disabled={isFetching}>
              {isFetching ? <Loader2 className="spinner" size={20} /> : "Query Brain"}
            </button>
          </div>
        </form>
      </div>

      <div className="results-container">
        {isFetching ? (
          <div className="search-state loading">
            <Activity className="pulse-icon" size={32} color="#ff2e2e" />
            <p>Scanning vector space...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="results-grid">
            <div className="results-header">
              <Sparkles size={16} color="#ff2e2e" />
              <span>Found {searchResults.length} relevant connections</span>
            </div>
            <div className="memory-grid">
              {searchResults.map((result) => (
                <MemoryCard 
                  // Priority: Mongo ID in metadata -> Mongo ID top level -> Pinecone ID
                  key={result.metadata?._id || result._id || result.id} 
                  data={result} 
                />
              ))}
            </div>
          </div>
        ) : query && !isFetching ? (
          <div className="search-state empty">
            <p>No direct neural links found for "<strong>{query}</strong>". Try a different phrase.</p>
          </div>
        ) : (
          <div className="search-state initial">
            <p>Your search results will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;