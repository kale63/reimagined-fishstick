import React, { useMemo, useCallback, useEffect } from 'react';
import { createEditor } from 'slate';
import type { BaseEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import type { ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import type { HistoryEditor } from 'slate-history';

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
      type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'bulleted-list' | 'numbered-list' | 'list-item';
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
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  useEffect(() => {
    if (onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

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

  return (
    <Slate editor={editor} initialValue={value} onChange={onChange}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        readOnly={readOnly}
        className="p-8 min-h-[500px] focus:outline-none"
        style={{ fontSize: '16px', lineHeight: '1.6' }}
      />
    </Slate>
  );
};

export default SlateEditor;
