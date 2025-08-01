import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import {
  Database, GitBranch, Clock, CheckCircle, XCircle,
  AlertTriangle, Info, ChevronRight, ChevronDown,
  Cpu, User, FileText, Globe, Zap
} from 'lucide-react';
import { apiIdentityService, DataProvenance, DataSourceType } from '../services/apiIdentityService';
import { formatDistanceToNow } from 'date-fns';

interface DataProvenanceDisplayProps {
  dataEUID: string;
  showFullLineage?: boolean;
  compact?: boolean;
  onSourceClick?: (sourceEUID: string) => void;
}

const DataProvenanceDisplay: React.FC<DataProvenanceDisplayProps> = ({
  dataEUID,
  showFullLineage = false,
  compact = false,
  onSourceClick
}) => {
  const [provenance, setProvenance] = useState<DataProvenance | null>(null);
  const [lineage, setLineage] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    loadProvenance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataEUID]);

  const loadProvenance = async () => {
    setLoading(true);
    try {
      const prov = await apiIdentityService.getDataProvenance(dataEUID);
      setProvenance(prov);
      
      if (showFullLineage && prov) {
        const lineageData = await apiIdentityService.getDataLineage(dataEUID);
        setLineage(lineageData);
      }
    } catch (error) {
      logger.error('Failed to load provenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (sourceType: DataSourceType) => {
    const icons: Record<DataSourceType, React.ReactNode> = {
      [DataSourceType.USER_INPUT]: <User className="w-4 h-4" />,
      [DataSourceType.API_FETCH]: <Globe className="w-4 h-4" />,
      [DataSourceType.FILE_UPLOAD]: <FileText className="w-4 h-4" />,
      [DataSourceType.DATABASE_SYNC]: <Database className="w-4 h-4" />,
      [DataSourceType.WEBHOOK_RECEIVE]: <Zap className="w-4 h-4" />,
      [DataSourceType.AI_GENERATION]: <Cpu className="w-4 h-4" />,
      [DataSourceType.SYSTEM_CALCULATION]: <Database className="w-4 h-4" />,
      [DataSourceType.EXTERNAL_IMPORT]: <Globe className="w-4 h-4" />,
      [DataSourceType.MANUAL_ENTRY]: <User className="w-4 h-4" />,
      [DataSourceType.AUTOMATED_PROCESS]: <Cpu className="w-4 h-4" />
    };
    return icons[sourceType] || <Info className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!provenance) {
    return (
      <div className="text-sm text-gray-500 italic">
        No provenance information available
      </div>
    );
  }

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <GitBranch className="w-4 h-4" />
        <span>Source: {provenance.sourceName}</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Data Provenance</h4>
        </div>
        {compact ? (
          <button
            onClick={() => setExpanded(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Source Information */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSourceIcon(provenance.sourceType)}
            <span className="text-sm font-medium">
              {provenance.sourceType.replace(/_/g, ' ')}
            </span>
          </div>
          <div className={`text-sm font-medium ${getConfidenceColor(provenance.confidence)}`}>
            {getConfidenceLabel(provenance.confidence)} Confidence
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Source:</span>
            {provenance.sourceEUID && onSourceClick ? (
              <button
                onClick={() => onSourceClick(provenance.sourceEUID!)}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {provenance.sourceName}
              </button>
            ) : (
              <span className="font-medium">{provenance.sourceName}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(provenance.timestamp))} ago</span>
          </div>
        </div>
      </div>

      {/* Transformations */}
      {provenance.transformations.length > 0 ? (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">
            Transformations ({provenance.transformations.length})
          </h5>
          <div className="space-y-1">
            {provenance.transformations.map((transform, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm bg-blue-50 rounded p-2"
              >
                {transform.isAI ? (
                  <Cpu className="w-4 h-4 text-blue-600 mt-0.5" />
                ) : (
                  <Database className="w-4 h-4 text-gray-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{transform.type}</div>
                  <div className="text-gray-600">{transform.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(transform.timestamp))} ago
                    {transform.isAI && ' • AI-powered'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Validations */}
      {provenance.validations.length > 0 ? (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">
            Validations ({provenance.validations.length})
          </h5>
          <div className="space-y-1">
            {provenance.validations.map((validation, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 text-sm rounded p-2 ${
                  validation.passed ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {validation.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{validation.type}</div>
                  {validation.message && (
                    <div className="text-gray-600">{validation.message}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Confidence: {(validation.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Full Lineage Timeline */}
      {showFullLineage && lineage ? (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">
            Complete Lineage Timeline
          </h5>
          <div className="relative">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            <div className="space-y-2">
              {(lineage as any).timeline.map((event: unknown, index: number) => (
                <div key={index} className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full z-10"></div>
                  <div className="flex-1 bg-white border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{(event as any).event}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date((event as any).timestamp))} ago
                      </span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      Entity: {(event as any).entity}
                    </div>
                    {(event as any).details && Object.keys((event as any).details).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {JSON.stringify((event as any).details, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Metadata */}
      {provenance.metadata && Object.keys(provenance.metadata).length > 0 ? (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          <div className="font-medium mb-1">Additional Metadata</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(provenance.metadata, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
};

export default DataProvenanceDisplay;