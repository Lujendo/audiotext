import React, { useCallback, useState, useEffect } from 'react';
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
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Focus } from '@tiptap/extension-focus';
import { Typography } from '@tiptap/extension-typography';
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
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Search,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Settings,
  Printer,
} from 'lucide-react';
import { Button } from '../ui/Button';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onExport?: (format: 'pdf' | 'docx' | 'txt' | 'srt' | 'vtt') => void;
  onEnhance?: () => void;
  onSummarize?: () => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  showAdvancedFeatures?: boolean;
  autoSave?: boolean;
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
  showAdvancedFeatures = true,
  autoSave = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWordCount, setShowWordCount] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Disable built-in link to avoid conflicts
        link: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlight',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2',
        },
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder,
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Typography,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `font-size: ${fontSize}px; line-height: ${lineHeight};`,
      },
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

  const addLink = useCallback(() => {
    if (editor) {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (editor) {
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }, [editor]);

  const insertHorizontalRule = useCallback(() => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run();
    }
  }, [editor]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const findAndReplace = useCallback(() => {
    if (editor) {
      const searchTerm = window.prompt('Find:');
      if (searchTerm) {
        const replaceTerm = window.prompt('Replace with:');
        if (replaceTerm !== null) {
          const content = editor.getHTML();
          const newContent = content.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
          editor.commands.setContent(newContent);
        }
      }
    }
  }, [editor]);

  const setHeading = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (editor) {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  }, [editor]);

  // Enhanced Auto-save functionality
  useEffect(() => {
    if (!editor || readOnly || !autoSave) return;

    const autoSaveTimer = setTimeout(() => {
      if (onSave && editor.getHTML() !== content) {
        console.log('Auto-saving content...');
        onSave();
      }
    }, 3000); // Auto-save every 3 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [editor, content, onSave, readOnly, autoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S for save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (onSave) onSave();
      }

      // Ctrl/Cmd + E for enhance
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        if (onEnhance) onEnhance();
      }

      // Ctrl/Cmd + Shift + S for summarize
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        if (onSummarize) onSummarize();
      }

      // F11 for fullscreen
      if (event.key === 'F11') {
        event.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave, onEnhance, onSummarize, isFullscreen]);

  // Update editor styles when font size or line height changes
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom as HTMLElement;
      editorElement.style.fontSize = `${fontSize}px`;
      editorElement.style.lineHeight = `${lineHeight}`;
    }
  }, [editor, fontSize, lineHeight]);

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>;
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'border border-gray-300 rounded-lg overflow-hidden'} ${className}`}>
      {/* Advanced Toolbar */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 p-4 shadow-sm">
        {/* Primary Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {/* Document Actions */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={readOnly || !onSave}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Save document"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(editor?.getText() || '')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={findAndReplace}
              disabled={readOnly}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              title="Find and replace"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={readOnly || !editor.can().undo()}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={readOnly || !editor.can().redo()}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={editor.isActive('heading', { level: 1 }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setHeading(1)}
              disabled={readOnly}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setHeading(2)}
              disabled={readOnly}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setHeading(3)}
              disabled={readOnly}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Secondary Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={editor.isActive('bold') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={readOnly}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={readOnly}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('underline') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={readOnly}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('strike') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={readOnly}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('subscript') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              disabled={readOnly}
              title="Subscript"
            >
              <span className="text-xs">X₂</span>
            </Button>
            <Button
              variant={editor.isActive('superscript') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              disabled={readOnly}
              title="Superscript"
            >
              <span className="text-xs">X²</span>
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              disabled={readOnly}
              title="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              disabled={readOnly}
              title="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              disabled={readOnly}
              title="Align right"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              disabled={readOnly}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={readOnly}
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={readOnly}
              title="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
          </div>

          {/* Block Elements */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={editor.isActive('blockquote') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={readOnly}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              variant={editor.isActive('code') ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={readOnly}
              title="Inline code"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertHorizontalRule}
              disabled={readOnly}
              title="Horizontal rule"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Media & Links */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={editor.isActive('link') ? 'primary' : 'ghost'}
              size="sm"
              onClick={addLink}
              disabled={readOnly}
              title="Add link"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addImage}
              disabled={readOnly}
              title="Add image"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
              disabled={readOnly}
              title="Insert table"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Advanced Styling */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border">
            <Type className="w-4 h-4 text-gray-500" />
            <select
              className="text-sm border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              onChange={(e) => setFontFamily(e.target.value)}
              disabled={readOnly}
              title="Font family"
            >
              <option value="">Default Font</option>
              <option value="Inter">Inter (Modern)</option>
              <option value="Georgia">Georgia (Serif)</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial (Sans-serif)</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Courier New">Courier New (Mono)</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
            </select>

            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-gray-500">Size:</span>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-16 accent-blue-500"
                title="Font size"
              />
              <span className="text-xs text-gray-600 w-6">{fontSize}px</span>
            </div>
          </div>

          {/* Line Height Control */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border">
            <span className="text-xs text-gray-500">Line Height:</span>
            <select
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="text-sm border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              title="Line height"
            >
              <option value="1.2">Tight (1.2)</option>
              <option value="1.4">Normal (1.4)</option>
              <option value="1.6">Relaxed (1.6)</option>
              <option value="1.8">Loose (1.8)</option>
              <option value="2.0">Double (2.0)</option>
            </select>
          </div>

          {/* Colors & Highlighting */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border">
            <div className="flex items-center gap-1">
              <Palette className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Text:</span>
              <input
                type="color"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-colors"
                onChange={(e) => setColor(e.target.value)}
                disabled={readOnly}
                title="Text color"
              />
            </div>
            <div className="flex items-center gap-1">
              <Highlighter className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Highlight:</span>
              <input
                type="color"
                defaultValue="#ffff00"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-colors"
                onChange={(e) => setHighlight(e.target.value)}
                disabled={readOnly}
                title="Highlight color"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              disabled={readOnly}
              title="Remove highlight"
              className="text-gray-500 hover:text-gray-700"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
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

          {/* AI-Powered Actions */}
          {(onEnhance || onSummarize) && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-2 shadow-sm border border-purple-200">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">AI Tools:</span>
              {onEnhance && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEnhance}
                  className="text-purple-600 border-purple-300 hover:bg-purple-100 transition-colors"
                  title="AI-powered text enhancement"
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
                  className="text-blue-600 border-blue-300 hover:bg-blue-100 transition-colors"
                  title="Generate intelligent summary"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Summarize
                </Button>
              )}
            </div>
          )}

          {/* View Options */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={showWordCount ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowWordCount(!showWordCount)}
              title="Toggle word count"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
              title="Print document"
              className="text-gray-600 hover:text-gray-700"
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>

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
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-64">
                  <div className="py-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Professional Export
                    </div>
                    <button
                      onClick={() => onExport('pdf')}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-3 text-red-500" />
                      <div>
                        <div className="font-medium">PDF Document</div>
                        <div className="text-xs text-gray-500">Professional format with formatting</div>
                      </div>
                    </button>
                    <button
                      onClick={() => onExport('docx')}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">Word Document</div>
                        <div className="text-xs text-gray-500">Editable DOCX with full formatting</div>
                      </div>
                    </button>
                    <button
                      onClick={() => onExport('txt')}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-3 text-gray-500" />
                      <div>
                        <div className="font-medium">Plain Text</div>
                        <div className="text-xs text-gray-500">Simple text without formatting</div>
                      </div>
                    </button>
                    {showAdvancedFeatures && (
                      <>
                        <button
                          onClick={() => onExport('srt')}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-3 text-purple-500" />
                          <div>
                            <div className="font-medium">SRT Subtitles</div>
                            <div className="text-xs text-gray-500">Subtitle format with timestamps</div>
                          </div>
                        </button>
                        <button
                          onClick={() => onExport('vtt')}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-3 text-indigo-500" />
                          <div>
                            <div className="font-medium">WebVTT Captions</div>
                            <div className="text-xs text-gray-500">Web video text tracks</div>
                          </div>
                        </button>
                      </>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => navigator.clipboard.writeText(editor?.getText() || '')}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-3 text-green-500" />
                        <div>
                          <div className="font-medium">Copy to Clipboard</div>
                          <div className="text-xs text-gray-500">Copy plain text content</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Editor Content */}
      <div className={`${isFullscreen ? 'h-screen' : 'min-h-[500px] max-h-[700px]'} overflow-y-auto bg-white`}>
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none p-6 focus:outline-none leading-relaxed"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            fontFamily: editor?.getAttributes('textStyle').fontFamily || 'inherit'
          }}
        />
      </div>

      {/* Advanced Status Bar */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-3">
        <div className="flex justify-between items-center">
          {showWordCount && (
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">
                  {editor?.storage.characterCount?.words() || 0} words
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  {editor?.storage.characterCount?.characters() || 0} characters
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">
                  {editor?.getText().split('\n').length || 0} lines
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">
                  ~{Math.ceil((editor?.storage.characterCount?.words() || 0) / 200)} min read
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Settings className="w-3 h-3" />
              <span>Professional Editor</span>
            </div>
            {autoSave && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Auto-save enabled</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <span>Font: {fontSize}px</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Line: {lineHeight}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Shortcuts: Ctrl+S (Save), Ctrl+E (Enhance), F11 (Fullscreen)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
