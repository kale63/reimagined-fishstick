import React, { createContext, useContext, useEffect, useState } from 'react';
import webSocketService from '../utils/websocket';
import { useAuth } from './AuthContext';

type WebSocketContextType = {
  isConnected: boolean;
  joinDocument: (documentId: string) => void;
  sendDocumentChange: (documentId: string, changes: any) => void;
  sendMessage: (documentId: string, userId: string, userName: string, message: string) => void;
  onDocumentUpdated: (callback: (data: any) => void) => void;
  onNewMessage: (callback: (data: any) => void) => void;
  offEvent: (event: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  joinDocument: () => {},
  sendDocumentChange: () => {},
  sendMessage: () => {},
  onDocumentUpdated: () => {},
  onNewMessage: () => {},
  offEvent: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const connectWebSocket = async () => {
      if (isAuthenticated && token) {
        const connected = await webSocketService.connect(token);
        setIsConnected(connected);
      } else {
        webSocketService.disconnect();
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      webSocketService.disconnect();
    };
  }, [isAuthenticated, token]);

  // WebSocket context value
  const value = {
    isConnected,
    joinDocument: (documentId: string) => webSocketService.joinDocument(documentId),
    sendDocumentChange: (documentId: string, changes: any) => webSocketService.sendDocumentChange(documentId, changes),
    sendMessage: (documentId: string, userId: string, userName: string, message: string) => 
      webSocketService.sendMessage(documentId, userId, userName, message),
    onDocumentUpdated: (callback: (data: any) => void) => webSocketService.onDocumentUpdated(callback),
    onNewMessage: (callback: (data: any) => void) => webSocketService.onNewMessage(callback),
    offEvent: (event: string) => webSocketService.off(event),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};