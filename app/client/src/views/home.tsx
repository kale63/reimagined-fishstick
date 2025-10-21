import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { DocumentService } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface DocumentItem {
  id: string;
  type: string;
  title: string;
  author: string;
  lastModified: string;
}

// To truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function Home() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  
  const [myDocsViewType, setMyDocsViewType] = useState<'grid' | 'list'>('grid');
  const [sharedDocsViewType, setSharedDocsViewType] = useState<'grid' | 'list'>('grid');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [myDocuments, setMyDocuments] = useState<DocumentItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Authentication check and document loading
  useEffect(() => {
    if (isLoading) return; // Wait for auth to load
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch documents using DocumentService
    DocumentService.getAllDocuments()
      .then(documents => {
        const formattedDocs = documents.map(doc => ({
          id: doc.id,
          type: 'document',
          title: doc.title,
          author: 'Tú',
          lastModified: new Date(doc.updated_at || doc.created_at).toLocaleDateString()
        }));
        setMyDocuments(formattedDocs);
      })
      .catch(error => {
        console.error('Error fetching documents:', error);
      });
  }, [isAuthenticated, isLoading, navigate]);
  
  const sharedDocuments: DocumentItem[] = [
    {
      id: "7",
      type: "document",
      title: "Presupuesto 2024",
      author: "María García",
      lastModified: "Hace 1 hora"
    },
    {
      id: "9",
      type: "document",
      title: "Política de Privacidad",
      author: "Ana Rodríguez",
      lastModified: "Hace 2 días"
    }
  ];

  const userName = authUser?.email ? authUser.email.split('@')[0] : "Usuario";
  
  // Toggle dropdown menu
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  
  // Navigate to document editor
  const navigateToEditor = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/editor/${id}`);
    setActiveDropdown(null);
  };
  
  // Delete document
  const handleDeleteDocument = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Confirm before deleting
    if (confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
      try {
        await DocumentService.deleteDocument(id);
        // Remove from local state
        setMyDocuments(prev => prev.filter(doc => doc.id !== id));
        setActiveDropdown(null);
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error al eliminar el documento');
      }
    }
  };
  
  // Click outside to close dropdowns
  const handleClickOutside = (e: React.MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setActiveDropdown(null);
    }
  };
  
  // Close dropdown when clicking outside with event listener
  useEffect(() => {
    function handleClickOutsideDropdown(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutsideDropdown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, [dropdownRef]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />
      <div className="container mx-auto px-4 md:px-6 py-8 bg-white text-gray-800 w-full max-w-full" onClick={handleClickOutside}>
      
      <p className="text-gray-600 mb-8">Gestiona tus documentos y colabora con tu equipo</p>
      
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mis Documentos</h2>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {e.stopPropagation(); setMyDocsViewType('grid');}} 
              className={`p-2 ${myDocsViewType === 'grid' ? 'bg-gray-100 text-blue-900' : 'text-gray-600'} rounded`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {e.stopPropagation(); setMyDocsViewType('list');}} 
              className={`p-2 ${myDocsViewType === 'list' ? 'bg-gray-100 text-blue-900' : 'text-gray-600'} rounded`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`grid ${myDocsViewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'grid-cols-1 gap-2'}`}>
          {/* Add Document Button as first item */}
          <div 
            onClick={() => navigate('/editor')}
            className={myDocsViewType === 'grid' 
              ? `border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 hover:border-blue-500 cursor-pointer transition-colors h-48` 
              : `border-2 border-dashed border-gray-300 rounded-lg flex items-center p-4 hover:border-blue-500 cursor-pointer transition-colors`
            }
          >
            <div className={`${myDocsViewType === 'grid' ? 'w-12 h-12' : 'w-8 h-8'} bg-gray-100 rounded-full flex items-center justify-center text-blue-900 ${myDocsViewType === 'grid' ? 'mb-2' : 'mr-3'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`${myDocsViewType === 'grid' ? 'h-6 w-6' : 'h-4 w-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-900">Nuevo Documento</span>
          </div>
          
          {/* Document Cards */}
          {myDocuments.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => navigate(`/editor/${doc.id}`)}
              className={`${myDocsViewType === 'grid' ? '' : 'flex items-center justify-between'} border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
            >
              {myDocsViewType === 'grid' ? (
                // Grid View
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 truncate max-w-[200px]">
                        {truncateText(doc.title, 20)}
                      </h3>
                    </div>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(doc.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      {activeDropdown === doc.id && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Abrir
                            </button>
                            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              Compartir
                            </button>
                            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteDocument(doc.id, e);
                              }}
                              className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                      JP
                    </div>
                    <span>{doc.author}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Última modificación: {doc.lastModified}
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="flex items-center">
                    <div className="mr-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{truncateText(doc.title, 30)}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center mr-1">
                          JP
                        </div>
                        <span>{doc.author} • Última modificación: {doc.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(doc.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {activeDropdown === doc.id && (
                      <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button 
                            onClick={(e) => navigateToEditor(doc.id, e)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Abrir
                          </button>
                          <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Compartir
                          </button>
                          <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteDocument(doc.id, e);
                            }}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Documentos Compartidos Conmigo</h2>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {e.stopPropagation(); setSharedDocsViewType('grid');}} 
              className={`p-2 ${sharedDocsViewType === 'grid' ? 'bg-gray-100 text-blue-900' : 'text-gray-600'} rounded`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {e.stopPropagation(); setSharedDocsViewType('list');}} 
              className={`p-2 ${sharedDocsViewType === 'list' ? 'bg-gray-100 text-blue-900' : 'text-gray-600'} rounded`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`grid ${sharedDocsViewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'grid-cols-1 gap-2'}`}>
          {sharedDocuments.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => navigate(`/editor/${doc.id}`)}
              className={`${sharedDocsViewType === 'grid' ? '' : 'flex items-center justify-between'} border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
            >
              {sharedDocsViewType === 'grid' ? (
                // Grid View
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 leading-tight">
                          {doc.title.length > 30 
                            ? <>
                                {doc.title.substring(0, 15)}
                                <br />
                                {doc.title.substring(15, 30)}
                                {doc.title.length > 30 ? '...' : ''}
                              </> 
                            : doc.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-xs text-blue-800 px-2 py-1 rounded">
                        Compartido
                      </div>
                      <div className="relative">
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(doc.id);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {activeDropdown === doc.id && (
                          <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button 
                                onClick={(e) => navigateToEditor(doc.id, e)}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Abrir
                              </button>
                              <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                      {doc.author.split(' ').map(name => name[0]).join('')}
                    </div>
                    <span>{doc.author}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Última modificación: {doc.lastModified}
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="flex items-center">
                    <div className="mr-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="max-w-[300px]">
                      <h3 className="font-semibold text-gray-800">
                        {doc.title.length > 40 
                          ? <>
                              {doc.title.substring(0, 40)}
                              <br/>
                              <span className="font-normal">{doc.title.substring(40, 70)}{doc.title.length > 70 ? '...' : ''}</span>
                            </> 
                          : doc.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center mr-1">
                          {doc.author.split(' ').map(name => name[0]).join('')}
                        </div>
                        <span>{doc.author} • Última modificación: {doc.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-xs text-blue-800 px-2 py-1 rounded">
                      Compartido
                    </div>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(doc.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      {activeDropdown === doc.id && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Abrir
                            </button>
                            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
