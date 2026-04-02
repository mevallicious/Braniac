import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Library, Search, Layers,Share2, 
  LogOut, BrainCircuit, Zap, Activity 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMemories } from '../../hooks/useMemories';

const Sidebar = () => {
  const { handleLogOut } = useAuth();
  
  const { memories, archiveNote } = useMemories(); 
  const [voidText, setVoidText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleVoidSubmit = async (e) => {
    if (e.key === 'Enter' && voidText.trim() && !e.shiftKey) {
      e.preventDefault();
      setIsSyncing(true);
      
      try {
        await archiveNote(voidText); 
        setVoidText('');
        console.log("🌌 Thought indexed in the void.");
      } catch (err) {
        console.error("The Void rejected your thought:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Library', path: '/library', icon: <Library size={20} /> },
    { name: 'Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Knowledge Map', path: '/graph', icon: <Share2 size={20} /> },
    { name: 'Collections', path: '/collections', icon: <Layers size={20} /> }
  ];

  return (
    <aside className="sidebar">
    
      <div className="sidebar-brand">
        <BrainCircuit className="brand-icon" size={28} />
        <span className="brand-name">Braniac</span>
      </div>

    
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      
      <div className={`the-void ${isSyncing ? 'syncing' : ''}`}>
        <div className="void-header">
          <Zap size={14} className={isSyncing ? 'pulse-icon' : ''} />
          <span>The Void</span>
        </div>
        <textarea 
          placeholder={isSyncing ? "Syncing with Brain..." : "Capture a thought..."} 
          value={voidText}
          disabled={isSyncing}
          onChange={(e) => setVoidText(e.target.value)}
          onKeyDown={handleVoidSubmit}
        />
        <p className="void-hint">
          {isSyncing ? "Processing Neural Link..." : "Press Enter to Index"}
        </p>
      </div>

    
      <div className="sidebar-footer">
        <div className="neural-stats">
          <div className="stat-item">
            <Activity size={14} className="stat-icon" />
            <span>{memories.length} Nodes Synced</span>
          </div>
        </div>
       
        <button className="logout-button" onClick={handleLogOut}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;