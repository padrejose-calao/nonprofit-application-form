/**
 * Document Export Utilities
 * Handles export of narrative content to PDF and DOCX formats
 */

export interface ExportOptions {
  title: string;
  content: string;
  format: 'pdf' | 'docx';
  metadata?: {
    author?: string;
    date?: Date;
    organization?: string;
  };
}

/**
 * Export content to PDF format
 * Creates a well-formatted PDF with proper styling
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { title, content, metadata } = options;
  
  // Create HTML structure for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: letter;
          margin: 1in;
        }
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
        }
        h1 {
          font-size: 24pt;
          margin-bottom: 24pt;
          text-align: center;
        }
        .metadata {
          text-align: center;
          margin-bottom: 36pt;
          font-style: italic;
          color: #666;
        }
        .content {
          text-align: justify;
          white-space: pre-wrap;
        }
        .footer {
          position: fixed;
          bottom: 0.5in;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10pt;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${metadata ? `
        <div class="metadata">
          ${metadata.organization ? `<div>${metadata.organization}</div>` : ''}
          ${metadata.author ? `<div>Prepared by: ${metadata.author}</div>` : ''}
          ${metadata.date ? `<div>${metadata.date.toLocaleDateString()}</div>` : ''}
        </div>
      ` : ''}
      <div class="content">${escapeHtml(content)}</div>
      <div class="footer">
        Page <span class="page"></span> of <span class="topage"></span>
      </div>
    </body>
    </html>
  `;
  
  // Create blob and trigger download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window for printing
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Export content to DOCX format
 * Creates a Word document with proper formatting
 */
export async function exportToDOCX(options: ExportOptions): Promise<void> {
  const { title, content, metadata } = options;
  
  // For now, create a simplified HTML that Word can open
  // In production, this would use a proper DOCX generation library
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11.0in;
          margin: 1.0in;
        }
        body {
          font-family: 'Calibri', sans-serif;
          font-size: 11pt;
          line-height: 1.5;
        }
        h1 {
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 12pt;
        }
        .metadata {
          text-align: center;
          font-style: italic;
          color: #666;
          margin-bottom: 24pt;
        }
        .content {
          text-align: justify;
          white-space: pre-wrap;
        }
        p {
          margin: 0 0 12pt 0;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${metadata ? `
        <div class="metadata">
          ${metadata.organization ? `<div>${metadata.organization}</div>` : ''}
          ${metadata.author ? `<div>Prepared by: ${metadata.author}</div>` : ''}
          ${metadata.date ? `<div>${metadata.date.toLocaleDateString()}</div>` : ''}
        </div>
      ` : ''}
      <div class="content">${content.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('')}</div>
    </body>
    </html>
  `;
  
  // Create blob with Word-specific MIME type
  const blob = new Blob([html], { 
    type: 'application/vnd.ms-word' 
  });
  
  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Read text content from uploaded document
 * Supports TXT, MD, and basic text extraction from other formats
 */
export async function readTextFromDocument(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Handle different file types
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        resolve(content);
      } else if (file.type === 'application/json') {
        try {
          const json = JSON.parse(content);
          // Extract text content from JSON structure
          const text = json.content || json.text || JSON.stringify(json, null, 2);
          resolve(text);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      } else {
        // For other formats, return the raw content
        // In production, this would use proper document parsing libraries
        resolve(content);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}