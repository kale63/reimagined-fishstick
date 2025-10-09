import { Editor, Transforms, Element as SlateElement, Path } from 'slate';

// Define element types
type BlockType = 
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
  | 'table'
  | 'table-row'
  | 'table-cell';

// Helper for checking if a format is currently active
export const isFormatActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n: any) => n[format] === true,
    universal: true,
  });
  return !!match;
};

// Helper for toggling marks (bold, italic, underline)
export const toggleMark = (editor: Editor, format: string) => {
  const isActive = isFormatActive(editor, format);
  
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Helper for checking if a block type is active
export const isBlockActive = (editor: Editor, format: BlockType) => {
  const [match] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === format,
  });
  
  return !!match;
};

// Define list types for easier reference
export const LIST_TYPES = ['bulleted-list', 'numbered-list'];

// Helper for toggling block types (paragraphs, headings, lists)
export const toggleBlock = (editor: Editor, format: BlockType) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);
  
  Transforms.unwrapNodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });
  
  let newProperties: Partial<SlateElement>;
  
  if (isList) {
    newProperties = {
      type: 'list-item',
    } as Partial<SlateElement>;
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : format,
    } as Partial<SlateElement>;
  }
  
  Transforms.setNodes(editor, newProperties);
  
  if (!isActive && isList) {
    const block = { type: format, children: [] } as SlateElement;
    Transforms.wrapNodes(editor, block);
  }
};

// Table helper functions
export const insertTable = (editor: Editor, rows: number = 3, cols: number = 3) => {
  const tableRows = [];
  
  for (let i = 0; i < rows; i++) {
    const cells = [];
    for (let j = 0; j < cols; j++) {
      cells.push({
        type: 'table-cell',
        children: [{ text: '' }],
      });
    }
    tableRows.push({
      type: 'table-row',
      children: cells,
    });
  }
  
  const table = {
    type: 'table',
    children: tableRows,
  } as SlateElement;
  
  Transforms.insertNodes(editor, table);
  
  // Add a paragraph after the table for easier editing
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  } as SlateElement);
};

export const isInTable = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      ['table', 'table-row', 'table-cell'].includes(n.type),
  });
  
  return !!match;
};

export const insertTableRow = (editor: Editor) => {
  if (!isInTable(editor)) return;
  
  // Find the table element
  const [table] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === 'table',
  });
  
  if (!table) return;
  const [tableNode, tablePath] = table;
  
  // Find the current row element
  const [tableRow] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === 'table-row',
  });
  
  if (!tableRow) return;
  
  const [rowNode, rowPath] = tableRow;
  
  // Get the index of the current row within the table
  const rowIndex = rowPath[rowPath.length - 1];
  
  // Get the number of cells in the current row to match in the new row
  const cellsCount = (rowNode as any).children.length;
  
  // Create new cells for the new row
  const newCells = [];
  for (let i = 0; i < cellsCount; i++) {
    newCells.push({
      type: 'table-cell',
      children: [{ text: '' }],
    });
  }
  
  // Create the new row element
  const newRow = {
    type: 'table-row',
    children: newCells,
  } as SlateElement;
  
  // Insert after the current row
  const insertPath = [...tablePath, rowIndex + 1];
  Transforms.insertNodes(editor, newRow, { at: insertPath });
};

export const insertTableColumn = (editor: Editor) => {
  if (!isInTable(editor)) return;
  
  const [table] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === 'table',
  });
  
  if (!table) return;
  
  const [tableNode, tablePath] = table;
  const rows = (tableNode as any).children;
  
  // Insert cells in reverse order to maintain correct indices
  for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex--) {
    const row = rows[rowIndex];
    const newCell = {
      type: 'table-cell',
      children: [{ text: '' }],
    } as SlateElement;
    
    const cellPath = [...tablePath, rowIndex, row.children.length];
    Transforms.insertNodes(editor, newCell, { at: cellPath });
  }
};

export const deleteTableRow = (editor: Editor) => {
  if (!isInTable(editor)) return;
  
  // Find the table element
  const [table] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === 'table',
  });
  
  if (!table) return;
  const [tableNode] = table;
  
  // Find the current row element
  const [tableRow] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === 'table-row',
  });
  
  if (!tableRow) return;
  
  const [, rowPath] = tableRow;
  
  // Check if this is the last row
  const rows = (tableNode as any).children;
  if (rows.length <= 1) {
    // Don't delete the last row in a table
    return;
  }
  
  Transforms.removeNodes(editor, { at: rowPath });
};

export const deleteTableColumn = (editor: Editor) => {
  if (!isInTable(editor)) return;
  
  const [tableCell] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === 'table-cell',
  });
  
  if (!tableCell) return;
  
  const [, cellPath] = tableCell;
  const cellIndex = cellPath[cellPath.length - 1];
  
  const [table] = Editor.nodes(editor, {
    match: (n: any) => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      n.type === 'table',
  });
  
  if (!table) return;
  
  const [tableNode, tablePath] = table;
  const rows = (tableNode as any).children;
  
  // Remove cells from each row at the specified column index in reverse order
  for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex--) {
    const cellPathToRemove = [...tablePath, rowIndex, cellIndex];
    Transforms.removeNodes(editor, { at: cellPathToRemove });
  }
};
