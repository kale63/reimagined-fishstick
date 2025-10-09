import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import SlateEditor from '../components/SlateEditor';
import type { Descendant } from 'slate';
import { toggleMark, toggleBlock, insertTable } from '../utils/editorHelpers';

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

// Define initial slate editor value
const initialEditorValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export default function Editor() {
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState('Plan de Marketing 2024');
  const [documentContent, setDocumentContent] = useState<Descendant[]>(initialEditorValue);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('hace 2 min');
  const [isLocked, setIsLocked] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Juan Pérez',
      text: 'Creo que deberíamos revisar esta sección para incluir más datos del mercado.',
      timestamp: 'hace 30 min',
      resolved: false
    },
    {
      id: '2',
      userId: '2',
      userName: 'María García',
      text: 'El presupuesto necesita ser actualizado con los nuevos costos de marketing digital.',
      timestamp: 'hace 20 min',
      resolved: true
    }
  ]);

  // Mock collaborators
  const [collaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      color: '#3B82F6',
      isActive: true,
      role: 'editor'
    },
    {
      id: '2',
      name: 'María García',
      color: '#10B981',
      isActive: true,
      role: 'editor'
    },
    {
      id: '3',
      name: 'Carlos López',
      color: '#F59E0B',
      isActive: false,
      role: 'viewer'
    },
    {
      id: '4',
      name: 'Ana Rodríguez',
      color: '#EF4444',
      isActive: true,
      role: 'editor'
    }
  ]);

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '2',
      userName: 'María García',
      message: '¿Podemos revisar la sección de presupuesto?',
      timestamp: 'hace 5 min'
    },
    {
      id: '2',
      userId: '1',
      userName: 'Juan Pérez',
      message: 'Claro, estoy revisando los números ahora',
      timestamp: 'hace 3 min'
    }
  ]);

  const handleBack = () => {
    // Navigate back to home page
    navigate('/home');
  };

  const handleShare = () => {
    //todo open share modal
  };

  const handleSave = async () => {
    setIsSaving(true);
    //todo save documentContent to backend
  };

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Tú',
      message,
      timestamp: 'ahora'
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const [editor, setEditor] = useState<any>(null);

  // Text formatting handlers for Slate
  const handleBoldClick = useCallback(() => {
    if (editor) {
      toggleMark(editor, 'bold');
    }
  }, [editor]);

  const handleItalicClick = useCallback(() => {
    if (editor) {
      toggleMark(editor, 'italic');
    }
  }, [editor]);

  const handleUnderlineClick = useCallback(() => {
    if (editor) {
      toggleMark(editor, 'underline');
    }
  }, [editor]);

  const handleHeadingClick = useCallback((level: 1 | 2 | 3) => {
    if (editor) {
      const blockType = `heading-${level === 1 ? 'one' : level === 2 ? 'two' : 'three'}` as any;
      toggleBlock(editor, blockType);
    }
  }, [editor]);

  const handleBulletListClick = useCallback(() => {
    if (editor) {
      toggleBlock(editor, 'bulleted-list');
    }
  }, [editor]);

  const handleNumberedListClick = useCallback(() => {
    if (editor) {
      toggleBlock(editor, 'numbered-list');
    }
  }, [editor]);

  // Table handler for insertion
  const handleInsertTableClick = useCallback(() => {
    if (editor) {
      insertTable(editor, 3, 3); // Default 3x3 table
    }
  }, [editor]);

  const handleAddComment = () => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: '1', // Current user
      userName: 'Juan Pérez',
      text: 'Nuevo comentario',
      timestamp: 'ahora',
      resolved: false
    };
    
    setComments(prevComments => [...prevComments, newComment]);
  };
  
  const handleResolveComment = (commentId: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: !comment.resolved }
          : comment
      )
    );
  };
  
  const handleToggleLock = () => {
    setIsLocked(prev => !prev);
  };

  const handleUndo = () => {
    editor.undo();
  };

  const handleRedo = () => {
    document.execCommand('redo', false);
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (documentContent) {
        setLastSaved('hace unos segundos');
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [documentContent]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <TopBar
        documentTitle={documentTitle}
        collaborators={collaborators}
        lastSaved={lastSaved}
        onBack={handleBack}
        onShare={handleShare}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-2">
            <div className="flex items-center space-x-1">
              {/* Format buttons */}
              <div className="flex items-center border-r border-gray-200 pr-2">
                <button 
                  onClick={handleBoldClick}
                  className="p-2 hover:bg-gray-100 rounded text-sm font-bold" 
                  title="Bold"
                >
                  B
                </button>
                <button 
                  onClick={handleItalicClick}
                  className="p-2 hover:bg-gray-100 rounded text-sm italic" 
                  title="Italic"
                >
                  I
                </button>
                <button 
                  onClick={handleUnderlineClick}
                  className="p-2 hover:bg-gray-100 rounded text-sm underline" 
                  title="Underline"
                >
                  U
                </button>
              </div>

              {/* Heading buttons */}
              <div className="flex items-center border-r border-gray-200 pr-2">
                <button 
                  onClick={() => handleHeadingClick(1)}
                  className="px-2 py-1 hover:bg-gray-100 rounded text-sm font-medium" 
                  title="Heading 1"
                >
                  H₁
                </button>
                <button 
                  onClick={() => handleHeadingClick(2)}
                  className="px-2 py-1 hover:bg-gray-100 rounded text-sm font-medium" 
                  title="Heading 2"
                >
                  H₂
                </button>
                <button 
                  onClick={() => handleHeadingClick(3)}
                  className="px-2 py-1 hover:bg-gray-100 rounded text-sm font-medium" 
                  title="Heading 3"
                >
                  H₃
                </button>
              </div>

              {/* List buttons */}
              <div className="flex items-center border-r border-gray-200 pr-2">
                <button 
                  onClick={handleBulletListClick}
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Bullet List"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                  </svg>
                </button>
                <button 
                  onClick={handleNumberedListClick}
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Numbered List"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
                  </svg>
                </button>
              </div>

              {/* Table button */}
              <div className="flex items-center border-r border-gray-200 pr-2">
                <button 
                  onClick={handleInsertTableClick}
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Insert Table"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"/>
                  </svg>
                </button>
              </div>

              {/* More buttons */}
              <div className="flex items-center">
                <button 
                  onClick={handleAddComment}
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Add Comment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </button>
                <button 
                  onClick={handleUndo}
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Undo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                  </svg>
                </button>
                <button 
                  onClick={handleRedo}
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Redo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                  </svg>
                </button>
              </div>

              <div className="flex-1" />

              {/* Sidebar toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
              >
                {isSidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
              </button>
            </div>
          </div>

          {/* Editor content */}
          <div className="flex-1 bg-white mx-6 my-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
            <SlateEditor 
              value={documentContent}
              onChange={setDocumentContent}
              placeholder="Comienza a escribir tu documento aquí..."
              readOnly={isLocked}
              onEditorReady={setEditor}
            />
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-30">
                <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" className="mx-auto text-gray-600 mb-2">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  </svg>
                  <p className="text-gray-800 font-medium">Documento bloqueado</p>
                  <p className="text-gray-600 text-sm mt-1">Haga clic en el ícono del candado para desbloquear</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          collaborators={collaborators}
          chatMessages={chatMessages}
          comments={comments}
          onSendMessage={handleSendMessage}
          onResolveComment={handleResolveComment}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
