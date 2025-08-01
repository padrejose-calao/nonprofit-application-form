import { Copy, Clipboard } from 'lucide-react';
import React, { useState } from 'react';
import { logger } from '../utils/logger';

interface CopyPasteButtonProps {
  value: string;
  onCopy?: () => void;
  onPaste?: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const CopyPasteButton: React.FC<CopyPasteButtonProps> = ({
  value,
  onCopy,
  onPaste,
  disabled = false,
  className = '',
}) => {
  const [showPaste, setShowPaste] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy?.();
    } catch (err) {
      logger.error('Failed to copy text: ', err);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPaste?.(text);
    } catch (err) {
      logger.error('Failed to paste text: ', err);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        disabled={disabled}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Copy to clipboard"
      >
        <Copy className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setShowPaste(!showPaste)}
        disabled={disabled}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Paste options"
      >
        <Clipboard className="h-4 w-4" />
      </button>

      {showPaste && (
        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            type="button"
            onClick={handlePaste}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Paste from clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default CopyPasteButton;
