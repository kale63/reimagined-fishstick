import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { createEditor, Transforms, Editor } from 'slate';
import type { BaseEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import type { ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import type { HistoryEditor } from 'slate-history';
import { isInTable, insertTableRow } from '../utils/editorHelpers';
import TableWithControls from './TableWithControls';

interface SlateEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  readOnly?: boolean;
  placeholder?: string;
  onEditorReady?: (editor: any) => void;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: {
      type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'bulleted-list' | 'numbered-list' | 'list-item' | 'table' | 'table-row' | 'table-cell';
      children: Descendant[];
    };
    Text: {
      text: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
    };
  }
}

const SlateEditor: React.FC<SlateEditorProps> = ({ 
  value, 
  onChange, 
  readOnly = false, 
  placeholder = 'Escribe tu documento aquí...',
  onEditorReady
}) => {
  const editor = useMemo(() => {
    console.log('🎨 [SlateEditor] Creating new editor instance');
    return withHistory(withReact(createEditor()));
  }, []);
  
  const [inTable, setInTable] = useState(false);
  const [editorValue, setEditorValue] = useState<Descendant[]>(value || []);
  
  // Debug: Log when value prop changes
  useEffect(() => {
    console.log('🎯 [SlateEditor] value prop changed:', {
      type: typeof value,
      isArray: Array.isArray(value),
      length: Array.isArray(value) ? value.length : 'N/A'
    });
  }, [value]);
  
  // Ensure value is always a valid array of Descendant elements
  const validValue = useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      console.log('⚠️ [SlateEditor] Using default empty value');
      return [
        {
          type: 'paragraph' as const,
          children: [{ text: '' }],
        },
      ];
    }
    console.log('✅ [SlateEditor] Using provided value with', value.length, 'elements');
    return value;
  }, [value]);
  
  // When the value from props changes, update internal editor value
  useEffect(() => {
    console.log('📝 [SlateEditor] Updating editorValue from prop');
    console.log('   First element:', validValue[0]);
    const firstElement = validValue[0] as any;
    console.log('   First element children:', firstElement?.children);
    if (firstElement?.children && firstElement.children.length > 0) {
      console.log('   First child text:', firstElement.children[0]);
    }
    setEditorValue(validValue);
  }, [validValue]);
  
  useEffect(() => {
    if (onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  const handleChange = useCallback((newValue: Descendant[]) => {
    console.log('🔄 [SlateEditor] Content changed');
    setEditorValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'heading-one':
        return <h1 className="text-2xl font-bold my-4" {...props.attributes}>{props.children}</h1>;
      case 'heading-two':
        return <h2 className="text-xl font-bold my-3" {...props.attributes}>{props.children}</h2>;
      case 'heading-three':
        return <h3 className="text-lg font-bold my-2" {...props.attributes}>{props.children}</h3>;
      case 'bulleted-list':
        return <ul className="pl-10 list-disc my-2" {...props.attributes}>{props.children}</ul>;
      case 'numbered-list':
        return <ol className="pl-10 list-decimal my-2" {...props.attributes}>{props.children}</ol>;
      case 'list-item':
        return <li className="pl-1 my-1" {...props.attributes}>{props.children}</li>;
      case 'table':
        return <TableWithControls attributes={props.attributes}>{props.children}</TableWithControls>;
      case 'table-row':
        return <tr className="border border-gray-300" {...props.attributes}>{props.children}</tr>;
      case 'table-cell':
        return (
          <td 
            className="border border-gray-300 p-3 min-w-[120px] h-full cursor-text relative hover:bg-gray-50 transition-colors" 
            style={{ verticalAlign: 'top', height: '100%', wordBreak: 'break-word' }}
            {...props.attributes}
          >
            <div className="min-h-[40px] h-full py-1">
              {props.children}
            </div>
          </td>
        );
      default:
        return <p className="my-2" {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    let { children } = props;

    if (props.leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (props.leaf.italic) {
      children = <em>{children}</em>;
    }

    if (props.leaf.underline) {
      children = <u>{children}</u>;
    }

    return <span {...props.attributes}>{children}</span>;
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      
      if (isInTable(editor)) {
        const [currentCell] = Editor.nodes(editor, {
          match: (n: any) => n.type === 'table-cell',
        });
        
        if (currentCell) {
          const [, cellPath] = currentCell;
          const nextCellPath = [...cellPath];
          nextCellPath[nextCellPath.length - 1] += 1;
          
          try {
            const [nextCell] = Editor.nodes(editor, {
              at: nextCellPath,
              match: (n: any) => n.type === 'table-cell',
            });
            
            if (nextCell) {
              Transforms.select(editor, Editor.start(editor, nextCellPath));
            } else {
              const rowPath = cellPath.slice(0, -1);
              const nextRowPath = [...rowPath];
              nextRowPath[nextRowPath.length - 1] += 1;
              const firstCellOfNextRow = [...nextRowPath, 0];
              
              try {
                const [nextRowCell] = Editor.nodes(editor, {
                  at: firstCellOfNextRow,
                  match: (n: any) => n.type === 'table-cell',
                });
                
                if (nextRowCell) {
                  Transforms.select(editor, Editor.start(editor, firstCellOfNextRow));
                }
              } catch {
                insertTableRow(editor);
              }
            }
          } catch {
          }
        }
      }
    }
    
    if (event.key === 'Enter' && isInTable(editor)) {
      event.preventDefault();
      editor.insertText('\n');
    }
  }, [editor]);

  return (
    <div className="flex flex-col">
      {(() => { console.log('🎨 [SlateEditor] Rendering with editorValue:', editorValue); return null; })()}
      <Slate editor={editor} value={editorValue} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className="p-8 min-h-[500px] focus:outline-none"
          style={{ fontSize: '16px', lineHeight: '1.6' }}
        />
      </Slate>
    </div>
  );
};

export default SlateEditor;
