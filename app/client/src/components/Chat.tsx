import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatProps {
  documentId: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  isMine: boolean;
}

const Chat: React.FC<ChatProps> = ({ documentId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webSocket = useWebSocket();
  const { user } = useAuth();

  // Handle incoming messages
  useEffect(() => {
    if (documentId && webSocket.isConnected) {
      webSocket.onNewMessage((data) => {
        if (data.documentId === documentId) {
          const message: Message = {
            id: data.id || Date.now().toString(),
            userId: data.userId,
            userName: data.userName,
            text: data.message,
            timestamp: new Date(),
            isMine: data.userId === user?.userId
          };
          
          setMessages(prev => [...prev, message]);
        }
      });
      
      return () => {
        webSocket.offEvent('new-message');
      };
    }
  }, [documentId, webSocket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    // Send message
    if (webSocket.isConnected) {
      webSocket.sendMessage(
        documentId,
        user.userId,
        user.email.split('@')[0],
        newMessage
      );
      
      const message: Message = {
        id: Date.now().toString(),
        userId: user.userId,
        userName: user.email.split('@')[0],
        text: newMessage,
        timestamp: new Date(),
        isMine: true
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Chat</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 ${message.isMine ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block px-3 py-2 rounded-lg max-w-xs lg:max-w-md ${
                message.isMine
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {!message.isMine && (
                <div className="font-medium text-sm mb-1">{message.userName}</div>
              )}
              <p className="text-sm">{message.text}</p>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe un mensaje..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;