import React, { useEffect } from 'react';
import { useMemories } from '../../hooks/useMemories';
import { useAuth } from "../../hooks/useAuth"
import QuickSave from '../components/QuickSave';
import MemoryCard from '../components/MemoryCard';
import { Sparkles, Clock, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { memories, fetchHistory, isFetching } = useMemories();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  
  const recentMemories = memories.slice(0, 6);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1>Welcome back, {user?.name || 'Braniac'} <Sparkles size={24} className="sparkle" /></h1>
          <p>Your neural network has <strong>{memories.length} nodes</strong> synced.</p>
        </div>
      </header>

      {/* Input section for URLs and Files */}
      <QuickSave />

      <section className="recent-section">
        <div className="section-header">
          <div className="title">
            <Clock size={18} />
            <h2>Recent Memories</h2>
          </div>
          <button className="text-btn"><Link to={"/library"}>View All</Link></button>
        </div>

        {isFetching && memories.length === 0 ? (
          <div className="loader-container">
            <div className="brain-loader"></div>
            <p>Accessing neural pathways...</p>
          </div>
        ) : (
          <div className="memory-grid">
            {recentMemories.map((item) => {
                if (!item || !item._id) return null; 
                return <MemoryCard key={item._id} data={item} />;
            })}
            
            {memories.length === 0 && !isFetching && (
              <div className="empty-state">
                <LayoutGrid size={40} />
                <p>Your brain is empty. Paste a link above to start indexing.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;