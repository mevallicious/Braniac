import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, BrainCircuit, Loader2, AtSign } from 'lucide-react'; // Added AtSign icon
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  // 1. ADDED 'username' to the state
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear error on new attempt
    
    try {
      await handleRegister(formData);
      navigate('/dashboard');
    } catch (err) {
      // 2. BETTER ERROR HANDLING: Extract the message from the backend response
      const serverMessage = err.response?.data?.message || "Registration failed.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <BrainCircuit size={48} className="auth-logo" />
          <h1>Join Braniac</h1>
          <p>Start building your neural archive.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* 3. NEW: USERNAME INPUT (Matches Backend) */}
          <div className="input-group">
            <User size={18} />
            <input 
              type="text" 
              placeholder="Unique Username" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <Mail size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Create Password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : (
              <>Initialize Brain <UserPlus size={18} /></>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already synced? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;