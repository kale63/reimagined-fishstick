import { useState } from 'react';
import { 
  ChatBubbleLeftIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isActive: boolean;
  role: 'editor' | 'viewer';
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

interface SidebarProps {
  collaborators: Collaborator[];
  chatMessages: ChatMessage[];
  comments?: Comment[];
  onSendMessage: (message: string) => void;
  onResolveComment?: (commentId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ 
  collaborators, 
  chatMessages, 
  comments = [],
  onSendMessage,
  onResolveComment,
  isOpen, 
  onClose 
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'chat' | 'comments'>('collaborators');
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full shadow-lg">
      <div className="p-2 border-b border-gray-200">
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex items-center justify-center flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'collaborators'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Colaboradores"
          >
            <UserGroupIcon className="h-5 w-5 flex-shrink-0" />
            {activeTab === 'collaborators' && (
              <span className="ml-2">Colaboradores</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Chat"
          >
            <ChatBubbleLeftIcon className="h-5 w-5 flex-shrink-0" />
            {activeTab === 'chat' && (
              <span className="ml-2">Chat</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center justify-center flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Comentarios"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 flex-shrink-0" />
            {activeTab === 'comments' && (
              <span className="ml-2">Comentarios</span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'comments' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Comentarios en línea
              </h3>
              
              {comments.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No hay comentarios todavía</p>
                  <p className="text-sm text-gray-500 mt-1">Haz clic en el botón de comentario en la barra de herramientas para agregar uno.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full flex-shrink-0 shadow" style={{ backgroundColor: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                          {comment.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">{comment.userName}</p>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                          
                          <div className="mt-3 flex items-center">
                            <button 
                              onClick={() => onResolveComment?.(comment.id)} 
                              className={`text-xs px-3 py-1.5 rounded-full font-medium ${comment.resolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              {comment.resolved ? 'Resuelto' : 'Resolver'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'collaborators' && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Colaboradores activos ({collaborators.filter(c => c.isActive).length})
            </h3>
            <div className="space-y-3">
              {collaborators.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No hay colaboradores todavía</p>
                  <p className="text-sm text-gray-500 mt-1">Invita a otros usuarios para colaborar en este documento.</p>
                </div>
              ) : (
                collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-3 py-2">
                  <div className="relative">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white text-base font-medium border-2 border-white shadow"
                      style={{ backgroundColor: collaborator.color }}
                    >
                      {collaborator.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    {collaborator.isActive && (
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{collaborator.name}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        collaborator.role === 'editor' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {collaborator.role === 'editor' ? 'Editor' : 'Visualizador'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {collaborator.isActive ? 'Activo ahora' : 'Desconectado'}
                    </p>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No hay mensajes todavía</p>
                  <p className="text-sm text-gray-500 mt-1">Sé el primero en enviar un mensaje al chat.</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                <div key={message.id} className="flex space-x-3 py-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium shadow">
                      {message.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{message.userName}</p>
                      <p className="text-xs text-gray-500">{message.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{message.message}</p>
                  </div>
                </div>
              ))
              )}
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Hide panel button */}
      <div className="border-t border-gray-200 p-4">
        <button 
          onClick={onClose}
          className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          <ArrowRightIcon className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Ocultar panel</span>
        </button>
      </div>
    </div>
  );
}
