import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { api } from '../services/api';
import { 
  LogOut, 
  Send, 
  UserPlus, 
  Settings, 
  MessageSquare, 
  Copy, 
  Check, 
  X, 
  Wifi, 
  WifiOff 
} from 'lucide-react';

export const ChatWorkspace: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { isConnected, messages, contacts, activePartner, setActivePartner, sendMessage, addContact } = useWebSocket();

  // Local UI states
  const [typedMessage, setTypedMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Form states for adding contact
  const [newContactEmail, setNewContactEmail] = useState('');
  const [addContactError, setAddContactError] = useState<string | null>(null);

  // Form states for settings
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activePartner]);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyPartnerId = () => {
    if (activePartner?.id) {
      navigator.clipboard.writeText(activePartner.id);
      // Optional: add UI notice
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activePartner) return;
    sendMessage(activePartner.id, typedMessage.trim());
    setTypedMessage('');
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddContactError(null);

    if (!newContactEmail.trim()) {
      setAddContactError('Please enter an email address');
      return;
    }

    try {
      const response = await api.get(`/v1/users/search?email=${newContactEmail.trim()}`);
      const foundUser = response.data;

      if (foundUser.id === user?.id) {
        setAddContactError('You cannot add yourself as a contact');
        return;
      }

      addContact(foundUser.id, foundUser.username, foundUser.email);
      
      // Auto-select the newly added contact
      setActivePartner({
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email
      });

      // Reset form
      setNewContactEmail('');
      setShowAddContact(false);
    } catch (err: any) {
      setAddContactError(err?.response?.data?.message || 'User not found with this email');
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(false);

    if (!editUsername.trim() || !editEmail.trim()) {
      setSettingsError('Please fill in all fields');
      return;
    }

    try {
      await updateProfile(editUsername.trim(), editEmail.trim());
      setSettingsSuccess(true);
      setTimeout(() => setShowSettings(false), 1500);
    } catch (err: any) {
      setSettingsError(err?.response?.data?.message || err?.message || 'Failed to update profile');
    }
  };

  const activeMessages = activePartner ? (messages[activePartner.id] || []) : [];

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      borderRadius: 0,
      border: 'none'
    }}>
      
      {/* Sidebar */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--panel-border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(15, 23, 42, 0.4)'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--panel-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-glow)',
                border: '1px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700'
              }}>
                {(user?.username || '').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>{user?.username}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {isConnected ? (
                    <>
                      <Wifi size={12} style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600' }}>Live Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} style={{ color: 'var(--error)' }} />
                      <span style={{ fontSize: '11px', color: 'var(--error)', fontWeight: '600' }}>Reconnecting</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => {
                  setEditUsername(user?.username || '');
                  setEditEmail(user?.email || '');
                  setShowSettings(true);
                }} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-400)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Settings"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={logout} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* User ID copy bar */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--slate-400)', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '200px' }}>
              My ID: {user?.id}
            </span>
            <button 
              onClick={handleCopyId}
              style={{
                background: 'none',
                border: 'none',
                color: copiedId ? 'var(--success)' : 'var(--slate-400)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {copiedId ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Contacts Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 8px 20px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chats</span>
          <button 
            onClick={() => setShowAddContact(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <UserPlus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Contact List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px 10px' }}>
          {contacts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--slate-400)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <MessageSquare size={32} style={{ opacity: 0.3 }} />
              <span>No active chats. Click Add to connect with a user by ID.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {contacts.map((contact) => {
                const isSelected = activePartner?.id === contact.id;
                const thread = messages[contact.id] || [];
                const lastMsg = thread[thread.length - 1];
                
                return (
                  <div
                    key={contact.id}
                    onClick={() => setActivePartner(contact)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--slate-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '13px'
                    }}>
                      {(contact.username || '').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: isSelected ? 'white' : 'var(--slate-200)' }}>
                          {contact.username}
                        </span>
                        {lastMsg && (
                          <span style={{ fontSize: '10px', color: 'var(--slate-400)' }}>
                            {new Date(lastMsg.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                              ? formatTime(lastMsg.createdAt)
                              : new Date(lastMsg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--slate-400)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px'
                      }}>
                        {lastMsg ? lastMsg.content : 'Start a conversation'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(11, 15, 25, 0.2)'
      }}>
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--panel-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(15, 23, 42, 0.2)'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{activePartner.username}</h3>
                <span style={{ fontSize: '12px', color: 'var(--slate-400)' }}>{activePartner.email}</span>
              </div>
              <div 
                onClick={handleCopyPartnerId}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  color: 'var(--slate-400)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'monospace'
                }}
                title="Copy User ID"
              >
                <span>ID: {activePartner.id.substring(0, 8)}...</span>
                <Copy size={12} />
              </div>
            </div>

            {/* Message Stream */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {activeMessages.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--slate-400)',
                  fontSize: '13px',
                  gap: '8px'
                }}>
                  <MessageSquare size={24} style={{ opacity: 0.3 }} />
                  <span>Send a message to start chatting</span>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwn ? 'flex-end' : 'flex-start',
                        gap: '4px'
                      }}>
                        <div style={{
                          backgroundColor: isOwn ? 'var(--primary)' : 'var(--slate-800)',
                          color: 'white',
                          padding: '10px 16px',
                          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          animation: 'slideUpIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                        }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--slate-400)', margin: '0 4px' }}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--panel-border)',
              display: 'flex',
              gap: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.2)'
            }}>
              <input
                type="text"
                className="glass-input"
                style={{ flex: 1, height: '44px' }}
                placeholder="Type your message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
              />
              <button 
                type="submit" 
                className="glass-button" 
                style={{ width: '44px', height: '44px', padding: 0 }}
                disabled={!typedMessage.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--slate-400)',
            gap: '16px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--panel-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <MessageSquare size={36} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '4px' }}>Welcome to chat.js</h3>
              <p style={{ fontSize: '14px', maxWidth: '320px', lineHeight: '1.4' }}>
                Select an active conversation or click Add in the sidebar to initiate a secure channel with a partner using their Email.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} className="animate-fade-in">
          <div className="glass-panel animate-slide-up" style={{
            width: '90%',
            maxWidth: '480px',
            padding: '30px',
            position: 'relative'
          }}>
            <button 
              onClick={() => {
                setShowAddContact(false);
                setAddContactError(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Add Conversation</h3>
            <p style={{ color: 'var(--slate-400)', fontSize: '13px', marginBottom: '24px', lineHeight: '1.4' }}>
              Establish a secure chat session. Enter the email address of the user you want to message.
            </p>

            {addContactError && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--error)',
                color: '#fca5a5',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {addContactError}
              </div>
            )}

            <form onSubmit={handleAddContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--slate-300)', textTransform: 'uppercase' }}>Partner Email Address</label>
                <input
                  type="email"
                  className="glass-input"
                  placeholder="e.g. john@example.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="glass-button" style={{ height: '44px', marginTop: '10px' }}>
                Start Conversation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} className="animate-fade-in">
          <div className="glass-panel animate-slide-up" style={{
            width: '90%',
            maxWidth: '440px',
            padding: '30px',
            position: 'relative'
          }}>
            <button 
              onClick={() => {
                setShowSettings(false);
                setSettingsError(null);
                setSettingsSuccess(false);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Profile Settings</h3>
            <p style={{ color: 'var(--slate-400)', fontSize: '13px', marginBottom: '24px' }}>
              Modify your account settings. This updates your profiles stored in the backend services database.
            </p>

            {settingsError && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--error)',
                color: '#fca5a5',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {settingsError}
              </div>
            )}

            {settingsSuccess && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--success)',
                color: '#a7f3d0',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Profile updated successfully
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--slate-300)', textTransform: 'uppercase' }}>Username</label>
                <input
                  type="text"
                  className="glass-input"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--slate-300)', textTransform: 'uppercase' }}>Email Address</label>
                <input
                  type="email"
                  className="glass-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="glass-button" style={{ height: '44px', marginTop: '10px' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
