import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Table as TableIcon,
  Save,
  Download,
  Copy,
  FileText,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onExport?: (format: 'pdf' | 'docx' | 'txt') => void;
  onEnhance?: () => void;
  onSummarize?: () => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onSave,
  onExport,
  onEnhance,
  onSummarize,
  className = '',
  placeholder = 'Start typing or paste your transcription here...',
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
      Underline,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setFontFamily = useCallback((fontFamily: string) => {
    if (editor) {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
  }, [editor]);

  const setColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  const setHighlight = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>;
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant={editor.isActive('bold') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={readOnly}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={readOnly}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('underline') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={readOnly}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('strike') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={readOnly}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              disabled={readOnly}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              disabled={readOnly}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              disabled={readOnly}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              disabled={readOnly}
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={readOnly}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={readOnly}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
          </div>

          {/* Block Elements */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant={editor.isActive('blockquote') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={readOnly}
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('code') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={readOnly}
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
              disabled={readOnly}
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Font Family */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <select
              className="text-sm border border-gray-300 rounded px-2 py-1"
              onChange={(e) => setFontFamily(e.target.value)}
              disabled={readOnly}
            >
              <option value="">Font</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <div className="flex items-center gap-1">
              <Palette className="w-4 h-4 text-gray-600" />
              <input
                type="color"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                onChange={(e) => setColor(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="flex items-center gap-1">
              <Highlighter className="w-4 h-4 text-gray-600" />
              <input
                type="color"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                onChange={(e) => setHighlight(e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo() || readOnly}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo() || readOnly}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* AI Actions */}
          {(onEnhance || onSummarize) && (
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              {onEnhance && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEnhance}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Enhance
                </Button>
              )}
              {onSummarize && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSummarize}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Summarize
                </Button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
            {onExport && (
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => onExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => onExport('docx')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as DOCX
                    </button>
                    <button
                      onClick={() => onExport('txt')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as TXT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 focus:outline-none"
          placeholder={placeholder}
        />
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between items-center">
        <div>
          Words: {editor.storage.characterCount?.words() || 0} | 
          Characters: {editor.storage.characterCount?.characters() || 0}
        </div>
        <div className="flex items-center gap-2">
          <Copy className="w-3 h-3" />
          <span>Ctrl+A to select all</span>
        </div>
      </div>
    </div>
  );
};
