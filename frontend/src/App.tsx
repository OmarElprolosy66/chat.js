import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AuthPages } from './components/AuthPages';
import { ChatWorkspace } from './components/ChatWorkspace';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0b0f19',
        color: 'var(--slate-400)',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        Loading secure session...
      </div>
    );
  }

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <WebSocketProvider>
          <ChatWorkspace />
        </WebSocketProvider>
      ) : (
        <AuthPages 
          isLoginMode={isLoginMode} 
          onToggleMode={() => setIsLoginMode(!isLoginMode)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
