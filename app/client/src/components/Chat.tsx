import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../utils/websocketService';

interface ChatProps {
  documentId: string | null;
}

export default function Chat({ documentId }: ChatProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, connected, error, sendMessage } = useChat(
    documentId,
    user?.userId || 'anonymous',
    user?.email || 'Anonymous User'
  );

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && connected) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!connected && (
          <div className="p-2 bg-yellow-50 text-yellow-700 rounded mb-2 text-sm">
            {error || "Conectando al chat..."}
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No hay mensajes aún. ¡Sé el primero en enviar uno!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.userId === user?.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg py-2 px-3 ${
                  message.userId === user?.userId 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.userId !== user?.userId && (
                  <div className="font-medium text-xs mb-1">
                    {message.userName}
                  </div>
                )}
                <p className="text-sm">{message.message}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!connected}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50"
            disabled={!connected || !newMessage.trim()}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
