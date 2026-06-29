import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

interface AuthPagesProps {
  onToggleMode: () => void;
  isLoginMode: boolean;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onToggleMode, isLoginMode }) => {
  const { login, register } = useAuth();
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        await login(email, password);
      } else {
        if (!username || !email || !password) {
          throw new Error('Please fill in all fields');
        }
        await register(username, email, password);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          {isLoginMode ? 'Sign In to chat.js' : 'Create an Account'}
        </h2>
        <p style={{ color: 'var(--slate-400)', fontSize: '14px' }}>
          {isLoginMode ? 'Connect in real-time with your contacts' : 'Start messaging instantly in secure tunnels'}
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid var(--error)',
          color: '#fca5a5',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!isLoginMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--slate-300)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                className="glass-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--slate-300)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="email"
              className="glass-input"
              style={{ width: '100%', paddingLeft: '40px' }}
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--slate-300)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="glass-input"
              style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="glass-button" style={{ height: '48px', marginTop: '10px' }} disabled={loading}>
          {loading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--slate-400)' }}>
        {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
        <button
          onClick={onToggleMode}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: '600',
            marginLeft: '6px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {isLoginMode ? 'Create one' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};
