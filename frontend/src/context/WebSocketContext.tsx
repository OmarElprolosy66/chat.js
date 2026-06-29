import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Contact {
  id: string;
  username: string;
  email: string;
  lastMessageAt?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  messages: Record<string, Message[]>; // Keyed by partner user ID
  contacts: Contact[];
  activePartner: Contact | null;
  setActivePartner: (contact: Contact | null) => void;
  sendMessage: (receiverId: string, content: string) => void;
  addContact: (id: string, username: string, email: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const userId = user?.id;
    if (!userId) return {};
    const stored = localStorage.getItem(`chat_messages_${userId}`);
    return stored ? JSON.parse(stored) : {};
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const userId = user?.id;
    if (!userId) return [];
    const stored = localStorage.getItem(`chat_contacts_${userId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [activePartner, setActivePartnerState] = useState<Contact | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Save contacts and messages to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`chat_contacts_${user.id}`, JSON.stringify(contacts));
    }
  }, [contacts, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  // Fetch message history from the backend when activePartner changes (on-demand loading)
  useEffect(() => {
    if (!activePartner || !user) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/v1/messages/${activePartner.id}`);
        const history: Message[] = response.data;

        setMessages((prev) => {
          const localThread = prev[activePartner.id] || [];
          const merged = [...history];

          // Merge local optimistic messages that haven't been saved to DB yet
          for (const localMsg of localThread) {
            const exists = merged.some(
              (m) =>
                m.id === localMsg.id ||
                (m.content === localMsg.content &&
                  Math.abs(new Date(m.createdAt).getTime() - new Date(localMsg.createdAt).getTime()) < 5000)
            );
            if (!exists) {
              merged.push(localMsg);
            }
          }

          return {
            ...prev,
            [activePartner.id]: merged,
          };
        });
      } catch (err) {
        console.error('Failed to fetch conversation history:', err);
      }
    };

    fetchHistory();
  }, [activePartner, user]);

  // Connect / disconnect WebSocket based on auth state
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token]);

  const connect = () => {
    if (socketRef.current) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      if (socketRef.current !== ws) return;
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      if (socketRef.current !== ws) return;
      try {
        const data = JSON.parse(event.data);
        
        // Handle standard message
        if (data.id && data.sender_id && data.receiver_id) {
          const incomingMessage = data as Message;
          const partnerId = incomingMessage.sender_id;

          // Append message to partner's thread
          setMessages((prev) => {
            const thread = prev[partnerId] || [];
            // Prevent duplicates
            if (thread.some((m) => m.id === incomingMessage.id)) return prev;
            return {
              ...prev,
              [partnerId]: [...thread, incomingMessage],
            };
          });

          // Update contacts lastMessageAt and order
          setContacts((prev) => {
            const index = prev.findIndex((c) => c.id === partnerId);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = { ...updated[index], lastMessageAt: incomingMessage.createdAt };
              // Move to top
              const [item] = updated.splice(index, 1);
              return [item, ...updated];
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      if (socketRef.current === ws) {
        setIsConnected(false);
        socketRef.current = null;
        // Trigger auto-reconnect if authenticated
        if (token) {
          queueReconnect();
        }
      }
    };

    ws.onerror = (err) => {
      console.error('[WS] Socket connection error:', err);
      if (socketRef.current === ws) {
        ws.close();
      }
    };
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  };

  const queueReconnect = () => {
    if (reconnectTimeoutRef.current) return;
    
    // Exponential backoff up to 16 seconds
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
    reconnectAttemptsRef.current += 1;

    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connect();
    }, delay);
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== 1 || !user) {
      console.warn('[WS] sendMessage aborted: Socket is not open or user is null.');
      return;
    }

    const payload = {
      receiver_id: receiverId,
      content,
    };

    socketRef.current.send(JSON.stringify(payload));

    // Construct optimistic message to append local history immediately
    const optimisticMessage: Message = {
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(7),
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => {
      const thread = prev[receiverId] || [];
      return {
        ...prev,
        [receiverId]: [...thread, optimisticMessage],
      };
    });

    // Update contacts list order
    setContacts((prev) => {
      const index = prev.findIndex((c) => c.id === receiverId);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], lastMessageAt: optimisticMessage.createdAt };
        const [item] = updated.splice(index, 1);
        return [item, ...updated];
      }
      return prev;
    });
  };

  const addContact = (id: string, username: string, email: string) => {
    setContacts((prev) => {
      if (prev.some((c) => c.id === id)) return prev;
      return [{ id, username, email }, ...prev];
    });
  };

  const setActivePartner = (partner: Contact | null) => {
    setActivePartnerState(partner);
    if (partner) {
      addContact(partner.id, partner.username, partner.email);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        messages,
        contacts,
        activePartner,
        setActivePartner,
        sendMessage,
        addContact,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
