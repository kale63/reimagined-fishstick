import { useState } from 'react';
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  Cog6ToothIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isActive: boolean;
}

interface TopBarProps {
  documentTitle: string;
  collaborators: Collaborator[];
  lastSaved: string;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
  onTitleChange?: (newTitle: string) => void;
  isSaving?: boolean;
}

export default function TopBar({ 
  documentTitle, 
  collaborators, 
  lastSaved, 
  onBack, 
  onShare, 
  onSave,
  onTitleChange,
  isSaving = false 
}: TopBarProps) {
  const [isAutoSave, setIsAutoSave] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(documentTitle);

  const activeCollaborators = collaborators.filter(c => c.isActive);

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== documentTitle) {
      onTitleChange?.(editedTitle.trim());
    } else {
      setEditedTitle(documentTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(documentTitle);
      setIsEditingTitle(false);
    }
  };
  
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-3">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-lg font-semibold text-gray-900 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h1 
              onClick={() => {
                setIsEditingTitle(true);
                setEditedTitle(documentTitle);
              }}
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
            >
              {documentTitle}
            </h1>
          )}
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{collaborators.length} colaboradores</span>
          </div>
        </div>
      </div>

      {/* Center section - Collaborators */}
      <div className="flex items-center space-x-2">
        {activeCollaborators.slice(0, 4).map((collaborator) => (
          <div
            key={collaborator.id}
            className="relative"
            title={collaborator.name}
          >
            {collaborator.avatar ? (
              <img
                src={collaborator.avatar}
                alt={collaborator.name}
                className="h-8 w-8 rounded-full border-2"
                style={{ borderColor: collaborator.color }}
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-white text-sm font-medium"
                style={{ 
                  backgroundColor: collaborator.color,
                  borderColor: collaborator.color 
                }}
              >
                {collaborator.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
            {collaborator.isActive && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
        ))}
        {activeCollaborators.length > 4 && (
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
            +{activeCollaborators.length - 4}
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>
            {isSaving ? 'Guardando...' : `Guardado ${lastSaved}`}
          </span>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setIsAutoSave(!isAutoSave)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isAutoSave ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            title={isAutoSave ? "Guardado automático activado" : "Guardado automático desactivado"}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                isAutoSave ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>

        <button
          onClick={onShare}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <ShareIcon className="h-4 w-4" />
          <span>Compartir</span>
        </button>

        {/* Config button */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
