import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  resizable?: boolean;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'indent',
  'size',
  'link',
  'image',
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text here...',
  disabled = false,
  height = 300,
  minHeight = 200,
  maxHeight = 600,
  resizable = true,
}) => {
  const [currentHeight, setCurrentHeight] = useState(height);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = (e: React.MouseEvent) => {
    if (!resizable || disabled) return;
    
    const startY = e.clientY;
    const startHeight = currentHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = startHeight + (e.clientY - startY);
      const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
      setCurrentHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={containerRef}
      className="rich-text-editor relative"
      style={{ height: currentHeight }}
    >
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={modules}
        formats={formats}
        style={{ 
          height: currentHeight - 50, // Account for toolbar and resize handle
          background: disabled ? '#f9fafb' : 'white' 
        }}
      />
      
      {resizable && !disabled && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-gray-200 hover:bg-gray-300 cursor-se-resize border-l border-t border-gray-300"
          onMouseDown={handleResize}
          title="Drag to resize"
        >
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2">
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-gray-500"></div>
            <div className="absolute bottom-1 right-0 w-1 h-1 bg-gray-500"></div>
            <div className="absolute bottom-0 right-1 w-1 h-1 bg-gray-500"></div>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        <span>
          Rich text editing: bullets, font size, formatting, links, images. 
          {resizable && ' Drag corner to resize.'} Spell check enabled by browser.
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
