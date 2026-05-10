'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TipTapEditor({ value, onChange, placeholder, className }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    immediatelyRender: false,
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-sm font-sans',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith('image/'));

        if (imageItem) {
          const file = imageItem.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              if (src) {
                view.dispatch(view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src })
                ));
              }
            };
            reader.readAsDataURL(file);
            return true; // handled
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value from props if it changes externally (and differs from current editor content)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="animate-pulse bg-white/5 rounded-2xl h-[200px]" />;
  }

  return (
    <div className={`relative w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-teal transition-all ${className}`}>
      {/* Toolbar - Optional but nice for rich text */}
      <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/5 overflow-x-auto hide-scrollbar">
        <ToolbarButton 
          active={editor.isActive('bold')} 
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
        />
        <ToolbarButton 
          active={editor.isActive('italic')} 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
        />
        <ToolbarButton 
          active={editor.isActive('strike')} 
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label="S"
        />
        <div className="w-px h-4 bg-white/10 mx-1" />
        <ToolbarButton 
          active={editor.isActive('bulletList')} 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="• List"
        />
        <ToolbarButton 
          active={editor.isActive('orderedList')} 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="1. List"
        />
        <div className="w-px h-4 bg-white/10 mx-1" />
        <ToolbarButton 
          active={editor.isActive('heading', { level: 3 })} 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="H3"
        />
        <ToolbarButton 
          active={false} 
          onClick={() => {
            const url = window.prompt('URL');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          label="Img"
        />
      </div>
      
      <EditorContent editor={editor} />
      
      {placeholder && !editor.getText() && (
        <div className="absolute top-[52px] left-4 pointer-events-none text-zinc-500 text-sm font-sans">
          {placeholder}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-teal text-navy' : 'bg-white/5 text-zinc-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
