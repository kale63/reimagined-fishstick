import { Editor, Transforms, Element as SlateElement } from 'slate';

// Define element types
type BlockType = 
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item';

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
