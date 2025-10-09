import React, { useState } from 'react';
import { useSlateStatic } from 'slate-react';
import { insertTableRow, insertTableColumn, deleteTableRow, deleteTableColumn } from '../utils/editorHelpers';

interface TableWithControlsProps {
  attributes: any;
  children: React.ReactNode;
}

const TableWithControls: React.FC<TableWithControlsProps> = ({ attributes, children }) => {
  const editor = useSlateStatic();
  const [showControls, setShowControls] = useState(false);

  const handleAddRow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    insertTableRow(editor);
  };

  const handleAddColumn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    insertTableColumn(editor);
  };

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTableRow(editor);
  };

  const handleDeleteColumn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTableColumn(editor);
  };

  return (
    <div 
      className="relative group inline-block"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Top controls for columns */}
      {showControls && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center space-x-2 z-20">
          <button
            onMouseDown={handleAddColumn}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-lg transition-all duration-200 flex items-center space-x-1"
            title="Add Column"
          >
            <span>Add Column</span>
          </button>
          <button
            onMouseDown={handleDeleteColumn}
            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md shadow-lg transition-all duration-200 flex items-center space-x-1"
            title="Delete Column"
          >
            <span>Delete Column</span>
          </button>
        </div>
      )}

      {/* Right controls for rows */}
      {showControls && (
        <div className="absolute -right-24 top-0 bottom-0 flex flex-col justify-center space-y-2 z-20">
          <button
            onMouseDown={handleAddRow}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-2 rounded-md shadow-lg transition-all duration-200 flex items-center"
            title="Add Row"
          >
            <span>Add Row</span>
          </button>
          <button
            onMouseDown={handleDeleteRow}
            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-2 rounded-md shadow-lg transition-all duration-200 flex items-center"
            title="Delete Row"
          >
            <span>Delete Row</span>
          </button>
        </div>
      )}

      <table 
        className="border-collapse border border-gray-300 my-4 w-full transition-all duration-200 hover:border-blue-400 table-auto" 
        style={{ minWidth: '300px', tableLayout: 'fixed' }}
        {...attributes}
      >
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default TableWithControls;