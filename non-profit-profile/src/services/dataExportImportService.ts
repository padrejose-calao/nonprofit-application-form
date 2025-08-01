import { netlifySettingsService } from './netlifySettingsService';
import { auditLogService } from './auditLogService';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { logger } from '../utils/logger';

// Type definitions for better type safety
interface ExportData {
  metadata: {
    exportDate: string;
    schemaVersion: string;
    dataType: string;
    options: ExportOptions;
    recordCount?: number;
    lastModified?: string | null;
  };
  data: unknown;
  auditLog?: AuditLogEntry[];
}

interface AuditLogEntry {
  timestamp: string;
  userName: string;
  action: string;
  resource: string;
  result: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

interface ImportSimulation {
  wouldImport: number;
  wouldSkip: number;
  warnings: string[];
}

interface DataRecord {
  id?: string;
  [key: string]: unknown;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf' | 'zip';
  sections?: string[];
  includeMetadata?: boolean;
  includeAttachments?: boolean;
  includeAuditLog?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ImportOptions {
  merge?: boolean;
  overwrite?: boolean;
  validateSchema?: boolean;
  dryRun?: boolean;
}

interface ExportResult {
  success: boolean;
  data?: Blob;
  filename?: string;
  error?: string;
}

interface ImportResult {
  success: boolean;
  imported?: number;
  skipped?: number;
  errors?: string[];
  warnings?: string[];
}

class DataExportImportService {
  private schemaVersion = '1.0.0';

  async exportData(
    dataType: string,
    options: ExportOptions = { format: 'json' }
  ): Promise<ExportResult> {
    try {
      // Log export action
      auditLogService.logAction({
        action: 'export',
        resource: dataType,
        metadata: { format: options.format, options },
        result: 'success'
      });

      // Get data based on type
      const data = await this.gatherDataForExport(dataType, options);

      // Format data based on requested format
      let blob: Blob;
      let filename: string;

      switch (options.format) {
        case 'json':
          blob = await this.exportAsJSON(data);
          filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'csv':
          blob = await this.exportAsCSV(data);
          filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'excel':
          blob = await this.exportAsExcel(data);
          filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;

        case 'pdf':
          blob = await this.exportAsPDF(data);
          filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.pdf`;
          break;

        case 'zip':
          blob = await this.exportAsZIP(data, dataType);
          filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.zip`;
          break;

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      return {
        success: true,
        data: blob,
        filename
      };
    } catch (error: unknown) {
      logger.error('Export failed:', error);
      
      auditLogService.logAction({
        action: 'export',
        resource: dataType,
        metadata: { format: options.format, options },
        result: 'failure',
        errorMessage: (error as any).message
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async gatherDataForExport(
    dataType: string,
    options: ExportOptions
  ): Promise<ExportData> {
    // Get main data first
    const mainData = await netlifySettingsService.get(dataType);
    
    const exportData: ExportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        schemaVersion: this.schemaVersion,
        dataType,
        options
      },
      data: mainData
    };

    // Include additional data based on options
    if (options.includeMetadata) {
      exportData.metadata.recordCount = Array.isArray(mainData) ? mainData.length : 1;
      exportData.metadata.lastModified = (mainData as any)?.lastModified || null;
    }

    if (options.includeAuditLog) {
      const auditLogs = await auditLogService.getAuditLogs({
        resource: dataType,
        startDate: options.dateRange?.start,
        endDate: options.dateRange?.end
      });
      exportData.auditLog = auditLogs.map(log => ({
        ...log,
        timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp
      }));
    }

    if (options.sections && Array.isArray(options.sections)) {
      // Filter data to only include requested sections
      const filteredData: Record<string, unknown> = {};
      options.sections.forEach(section => {
        if (mainData && typeof mainData === 'object' && mainData[section as keyof typeof mainData] !== undefined) {
          filteredData[section] = (mainData as Record<string, unknown>)[section];
        }
      });
      exportData.data = filteredData;
    }

    return exportData;
  }

  private async exportAsJSON(data: ExportData): Promise<Blob> {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  private async exportAsCSV(data: ExportData): Promise<Blob> {
    // Flatten nested data for CSV export
    const flatData = this.flattenData(data.data);
    
    // Convert to CSV using Papa Parse
    const csv = Papa.unparse(flatData, {
      header: true,
      skipEmptyLines: true
    });
    
    return new Blob([csv], { type: 'text/csv' });
  }

  private async exportAsExcel(data: ExportData): Promise<Blob> {
    // This would require a library like xlsx or exceljs
    // For now, we'll create a CSV that Excel can open
    return this.exportAsCSV(data);
  }

  private async exportAsPDF(data: ExportData): Promise<Blob> {
    // Generate HTML content
    const html = this.generateHTMLReport(data);
    
    // In production, this would use a PDF generation service
    // For now, return HTML that can be printed to PDF
    return new Blob([html], { type: 'text/html' });
  }

  private async exportAsZIP(data: ExportData, dataType: string): Promise<Blob> {
    const zip = new JSZip();
    
    // Add main data as JSON
    zip.file(`${dataType}.json`, JSON.stringify(data.data, null, 2));
    
    // Add metadata
    if (data.metadata) {
      zip.file('metadata.json', JSON.stringify(data.metadata, null, 2));
    }
    
    // Add audit log if included
    if (data.auditLog) {
      zip.file('audit_log.json', JSON.stringify(data.auditLog, null, 2));
      
      // Also add as CSV for easier viewing
      const auditCSV = Papa.unparse(data.auditLog, {
        header: true,
        skipEmptyLines: true
      });
      zip.file('audit_log.csv', auditCSV);
    }
    
    // Add README
    const readme = this.generateReadme(data, dataType);
    zip.file('README.txt', readme);
    
    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
  }

  private flattenData(data: unknown, prefix = ''): Record<string, unknown>[] {
    if (Array.isArray(data)) {
      return data.map(item => this.flattenObject(item, prefix));
    }
    return [this.flattenObject(data as Record<string, unknown>, prefix)];
  }

  private flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        flattened[newKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, this.flattenObject(value as Record<string, unknown>, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join(', ');
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  }

  private generateHTMLReport(data: ExportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Data Export Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          h2 { color: #666; }
          .metadata { background: #f5f5f5; padding: 10px; margin: 10px 0; }
          .section { margin: 20px 0; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .json-view { background: #f9f9f9; padding: 10px; border: 1px solid #ddd; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <h1>Data Export Report</h1>
        
        <div class="metadata">
          <h2>Export Metadata</h2>
          <p><strong>Export Date:</strong> ${data.metadata.exportDate}</p>
          <p><strong>Data Type:</strong> ${data.metadata.dataType}</p>
          <p><strong>Schema Version:</strong> ${data.metadata.schemaVersion}</p>
          ${data.metadata.recordCount ? `<p><strong>Record Count:</strong> ${data.metadata.recordCount}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>Exported Data</h2>
          <div class="json-view">
            <pre>${JSON.stringify(data.data, null, 2)}</pre>
          </div>
        </div>
        
        ${data.auditLog ? `
          <div class="section">
            <h2>Audit Log</h2>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                ${data.auditLog.map((log: AuditLogEntry) => `
                  <tr>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td>${log.userName}</td>
                    <td>${log.action}</td>
                    <td>${log.resource}</td>
                    <td>${log.result}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  private generateReadme(data: ExportData, dataType: string): string {
    return `Data Export - ${dataType}
=====================================

Export Date: ${data.metadata.exportDate}
Schema Version: ${data.metadata.schemaVersion}

This ZIP file contains:
- ${dataType}.json: Main data export
${data.metadata ? '- metadata.json: Export metadata and configuration' : ''}
${data.auditLog ? '- audit_log.json: Audit trail in JSON format' : ''}
${data.auditLog ? '- audit_log.csv: Audit trail in CSV format' : ''}
- README.txt: This file

Data Structure:
The main data file contains all exported information in JSON format.
Nested objects and arrays are preserved in their original structure.

Importing Data:
To import this data back into the system:
1. Use the Import function in the application
2. Select the ${dataType}.json file
3. Choose whether to merge or overwrite existing data
4. Review the import preview
5. Confirm the import

For questions or support, please contact your system administrator.
`;
  }

  async importData(
    file: File,
    dataType: string,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    try {
      // Log import attempt
      auditLogService.logAction({
        action: 'import',
        resource: dataType,
        metadata: { filename: file.name, options },
        result: 'success'
      });

      // Parse file based on type
      let data: unknown;
      if (file.name.endsWith('.json')) {
        data = await this.parseJSONFile(file);
      } else if (file.name.endsWith('.csv')) {
        data = await this.parseCSVFile(file);
      } else if (file.name.endsWith('.zip')) {
        data = await this.parseZIPFile(file);
      } else {
        throw new Error('Unsupported file format');
      }

      // Validate schema if requested
      if (options.validateSchema) {
        const validation = await this.validateDataSchema(data, dataType);
        if (!validation.valid) {
          return {
            success: false,
            errors: validation.errors
          };
        }
      }

      // Perform dry run if requested
      if (options.dryRun) {
        const simulation = await this.simulateImport(data, dataType, options);
        return {
          success: true,
          imported: simulation.wouldImport,
          skipped: simulation.wouldSkip,
          warnings: simulation.warnings
        };
      }

      // Perform actual import
      const result = await this.performImport(data, dataType, options);
      
      return result;
    } catch (error: unknown) {
      logger.error('Import failed:', error);
      
      auditLogService.logAction({
        action: 'import',
        resource: dataType,
        metadata: { filename: file.name, options },
        result: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async parseJSONFile(file: File): Promise<unknown> {
    const text = await file.text();
    return JSON.parse(text);
  }

  private async parseCSVFile(file: File): Promise<unknown> {
    const text = await file.text();
    const result = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    
    if (result.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    return result.data;
  }

  private async parseZIPFile(file: File): Promise<unknown> {
    const zip = await JSZip.loadAsync(file);
    const data: Record<string, unknown> = {};
    
    // Look for main data file
    const dataFiles = Object.keys(zip.files).filter(name => 
      name.endsWith('.json') && !name.includes('metadata') && !name.includes('audit')
    );
    
    if (dataFiles.length === 0) {
      throw new Error('No data file found in ZIP');
    }
    
    // Parse main data file
    const mainFile = await zip.files[dataFiles[0]].async('string');
    data.data = JSON.parse(mainFile);
    
    // Parse metadata if exists
    if (zip.files['metadata.json']) {
      const metadataFile = await zip.files['metadata.json'].async('string');
      data.metadata = JSON.parse(metadataFile);
    }
    
    return data;
  }

  private async validateDataSchema(data: unknown, dataType: string): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // Check if data has the expected structure
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
    }
    
    // Check for required fields based on data type
    const requiredFields = this.getRequiredFields(dataType);
    requiredFields.forEach(field => {
      const dataObj = data as Record<string, unknown>;
      if (!dataObj[field] && !((dataObj.data as Record<string, unknown>)?.[field])) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Validate data types
    const dataObj = data as Record<string, unknown>;
    const metadata = dataObj.metadata as Record<string, unknown>;
    if (metadata && metadata.schemaVersion) {
      if (metadata.schemaVersion !== this.schemaVersion) {
        errors.push(`Schema version mismatch: expected ${this.schemaVersion}, got ${metadata.schemaVersion}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private getRequiredFields(dataType: string): string[] {
    // Define required fields for each data type
    const requiredFieldsMap: Record<string, string[]> = {
      'nonprofit_application': ['organizationName', 'ein'],
      'contacts': ['name', 'email'],
      'programs': ['programName', 'description'],
      'documents': ['fileName', 'uploadDate']
    };
    
    return requiredFieldsMap[dataType] || [];
  }

  private async simulateImport(
    data: unknown,
    dataType: string,
    options: ImportOptions
  ): Promise<ImportSimulation> {
    const warnings: string[] = [];
    let wouldImport = 0;
    let wouldSkip = 0;
    
    // Get existing data
    const existingData = await netlifySettingsService.get(dataType);
    
    // Determine what would happen
    if (Array.isArray(data)) {
      data.forEach((item: unknown) => {
        if (options.merge && this.wouldConflict(item as DataRecord, existingData)) {
          warnings.push(`Conflict detected for item: ${JSON.stringify(item).substring(0, 50)}...`);
          wouldSkip++;
        } else {
          wouldImport++;
        }
      });
    } else {
      wouldImport = 1;
      if (existingData && !options.overwrite) {
        warnings.push('Existing data would be preserved (merge mode)');
      }
    }
    
    return { wouldImport, wouldSkip, warnings };
  }

  private wouldConflict(item: DataRecord, existingData: unknown): boolean {
    if (!existingData) return false;
    
    // Check for ID conflicts
    if (item.id && Array.isArray(existingData)) {
      return existingData.some((existing: unknown) => (existing as DataRecord).id === item.id);
    }
    
    return false;
  }

  private async performImport(
    data: unknown,
    dataType: string,
    options: ImportOptions
  ): Promise<ImportResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let imported = 0;
    let skipped = 0;
    
    try {
      // Get existing data
      const existingData = await netlifySettingsService.get(dataType);
      
      // Prepare final data
      let finalData: unknown;
      
      if (options.overwrite || !existingData) {
        // Overwrite mode or no existing data
        const dataObj = data as Record<string, unknown>;
        finalData = dataObj.data || data;
        imported = Array.isArray(finalData) ? finalData.length : 1;
      } else if (options.merge) {
        // Merge mode
        if (Array.isArray(data)) {
          finalData = existingData || [];
          data.forEach((item: unknown) => {
            const dataRecord = item as DataRecord;
            if (!this.wouldConflict(dataRecord, finalData)) {
              (finalData as any[]).push(item);
              imported++;
            } else {
              skipped++;
              warnings.push(`Skipped duplicate item: ${dataRecord.id || 'unknown'}`);
            }
          });
        } else {
          // Merge objects
          const dataObj = data as Record<string, unknown>;
          const mergeData = dataObj.data || data;
          finalData = { ...existingData, ...(mergeData as Record<string, unknown>) };
          imported = 1;
        }
      } else {
        // Default: preserve existing
        warnings.push('No import mode specified, existing data preserved');
        return { success: true, imported: 0, skipped: 0, warnings };
      }
      
      // Save imported data
      await netlifySettingsService.set(dataType, finalData);
      
      // Log successful import
      auditLogService.logAction({
        action: 'import',
        resource: dataType,
        metadata: { 
          imported,
          skipped,
          mode: options.overwrite ? 'overwrite' : 'merge'
        },
        result: 'success'
      });
      
      return {
        success: true,
        imported,
        skipped: skipped > 0 ? skipped : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error: unknown) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        errors
      };
    }
  }

  async downloadExport(result: ExportResult): Promise<void> {
    if (!result.success || !result.data || !result.filename) {
      throw new Error('Invalid export result');
    }
    
    // Create download link
    const url = URL.createObjectURL(result.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const dataExportImportService = new DataExportImportService();