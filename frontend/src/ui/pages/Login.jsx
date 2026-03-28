import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Sparkles, BrainCircuit, Loader2, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  // Use 'identifier' to represent either Email or Username
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Mapping 'identifier' to both fields so the backend's $or logic catches it
      await handleLogin({ 
        email: formData.identifier, 
        username: formData.identifier, 
        password: formData.password 
      });
      navigate('/dashboard');
    } catch (err) {
      // Reach into the Axios error to get your "invalid credentials" message
      const serverMessage = err.response?.data?.message || "Check your credentials, bro.";
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
          <h1>Enter Braniac</h1>
          <p>Sync with your second brain.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User size={18} /> {/* Changed to User icon for flexibility */}
            <input 
              type="text" 
              placeholder="Email or Username" 
              required
              value={formData.identifier}
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
            />
          </div>

          <div className="input-group">
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : (
              <>Sign In <Sparkles size={18} /></>
            )}
          </button>
        </form>

        <p className="auth-footer">
          New to the network? <Link to="/register">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;