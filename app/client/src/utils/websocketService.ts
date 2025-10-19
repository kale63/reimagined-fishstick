import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Define message type
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  documentId?: string; // Optional document ID to associate messages with a specific document
}

// Socket.io instance
let socket: Socket | null = null;

// API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Initialize socket connection
 */
export const initSocket = (token: string | null) => {
  if (!token) {
    console.error('❌ initSocket called with no token!');
    return null;
  }

  console.log('🔌 initSocket called with token:', `${token.substring(0, 20)}...`);
  
  // Return existing connected socket if already initialized and connected
  if (socket?.connected) {
    console.log('✅ Socket already connected, returning existing socket');
    return socket;
  }

  // If socket exists but not connected, disconnect first to reconnect with new token
  if (socket && !socket.connected) {
    console.log('🔄 Socket exists but not connected, disconnecting and reconnecting');
    socket.disconnect();
  }

  // Create new connection with auth token
  console.log('🚀 Creating new Socket.io connection');
  console.log('   API_BASE_URL:', API_BASE_URL);
  console.log('   Token:', `${token.substring(0, 30)}...`);
  
  socket = io(API_BASE_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'], // Try websocket first, fall back to polling
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ WebSocket connected successfully');
  });

  socket.on('connect_error', (err) => {
    console.error('❌ WebSocket connection error:', err.message || err);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ WebSocket disconnected. Reason:', reason);
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Join a document chat room
 * @param documentId - The ID of the document to join its chat room
 */
export const joinDocumentRoom = (documentId: string) => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized, cannot join room');
    return;
  }
  
  if (!socket.connected) {
    console.warn('⚠️ Socket not connected, cannot join room');
    return;
  }
  
  console.log('🚪 Joining document room:', documentId);
  socket.emit('join_document', { documentId });
};

/**
 * Leave a document chat room
 * @param documentId - The ID of the document to leave its chat room
 */
export const leaveDocumentRoom = (documentId: string) => {
  if (socket && socket.connected) {
    socket.emit('leave_document', { documentId });
  }
};

/**
 * Send a message through WebSocket
 * @param message - Message text
 * @param documentId - Associated document ID
 * @param userId - Sender user ID
 * @param userName - Sender user name
 */
export const sendMessage = (message: string, documentId: string, userId: string, userName: string) => {
  console.log('📤 sendMessage called:', { message, documentId, userId, userName });
  
  if (!socket) {
    console.error('❌ Socket not initialized');
    return null;
  }
  
  if (!socket.connected) {
    console.error('❌ Socket not connected');
    return null;
  }
  
  const chatMessage: ChatMessage = {
    id: Date.now().toString(),
    userId,
    userName,
    message,
    timestamp: new Date().toISOString(),
    documentId
  };

  console.log('📮 Emitting chat_message event:', chatMessage);
  socket.emit('chat_message', chatMessage);
  return chatMessage;
  return null;
};

/**
 * React hook to use WebSocket chat functionality
 * @param documentId - Current document ID
 * @param userId - Current user ID
 * @param userName - Current user name
 */
export const useChat = (documentId: string | null, userId: string, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState<boolean>(socket?.connected || false);
  const [error, setError] = useState<string | null>(null);

  console.log('🔧 useChat hook initialized:', { documentId, userId, userName, socketConnected: socket?.connected });

  useEffect(() => {
    // Ensure socket exists, if not try to get it
    let activeSocket = socket;
    console.log('📌 useChat effect running:', { documentId, hasSocket: !!activeSocket, socketConnected: activeSocket?.connected });
    
    if (!activeSocket) {
      console.warn('⚠️ useChat: Socket not initialized');
      return; // Socket not yet initialized
    }

    if (!documentId) {
      console.warn('⚠️ useChat: No documentId provided');
      return;
    }

    // Listen for incoming messages
    const messageHandler = (msg: ChatMessage) => {
      console.log('📨 Received chat_message event:', msg);
      if (msg.documentId === documentId) {
        console.log('✅ Message matches current documentId, adding to messages');
        setMessages(prev => [...prev, msg]);
      } else {
        console.log('⚠️ Message documentId does not match:', { receivedDocId: msg.documentId, currentDocId: documentId });
      }
    };

    // Listen for connection status
    const connectHandler = () => {
      console.log('✅ Socket connected event, setting connected=true and joining room');
      setConnected(true);
      setError(null);
      if (documentId) {
        console.log('🚪 Joining document room from connectHandler:', documentId);
        joinDocumentRoom(documentId);
      }
    };

    const errorHandler = (err: Error) => {
      console.error('❌ Socket error:', err);
      setConnected(false);
      setError(err.message);
    };

    const disconnectHandler = (reason: string) => {
      console.log('⚠️ Socket disconnected:', reason);
      setConnected(false);
    };

    // Register event handlers
    activeSocket.on('connect', connectHandler);
    activeSocket.on('disconnect', disconnectHandler);
    activeSocket.on('connect_error', errorHandler);
    activeSocket.on('chat_message', messageHandler);

    // Join room immediately if connected
    if (activeSocket.connected && documentId) {
      console.log('🚪 Socket already connected, joining document room:', documentId);
      joinDocumentRoom(documentId);
      setConnected(true);
    } else if (!activeSocket.connected) {
      console.warn('⚠️ Socket not connected yet, will join when connection established');
    }

    // Cleanup
    return () => {
      console.log('🧹 useChat cleanup - leaving room:', documentId);
      activeSocket?.off('connect', connectHandler);
      activeSocket?.off('disconnect', disconnectHandler);
      activeSocket?.off('connect_error', errorHandler);
      activeSocket?.off('chat_message', messageHandler);
      
      // Leave room on unmount
      if (documentId) {
        leaveDocumentRoom(documentId);
      }
    };
  }, [documentId]);

  // Send message function
  const sendChatMessage = (message: string) => {
    if (!documentId) {
      console.error('❌ sendChatMessage: No documentId');
      setError('No active document');
      return null;
    }

    console.log('📤 sendChatMessage called:', { message, documentId, userId, userName });
    return sendMessage(message, documentId, userId, userName);
  };

  return {
    messages,
    connected,
    error,
    sendMessage: sendChatMessage,
  };
};

export default {
  initSocket,
  getSocket,
  joinDocumentRoom,
  leaveDocumentRoom,
  sendMessage,
  useChat
};