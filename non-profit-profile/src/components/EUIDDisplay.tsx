import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { 
  Hash, Info, Link, Clock, User, Building, 
  FileText, Copy, Check, AlertCircle, History
} from 'lucide-react';
import { EntityType, EntityStatus, AccessLevel } from '../services/euidTypes';
import { euidService } from '../services/euidService';
import { toast } from 'react-toastify';

interface EUIDDisplayProps {
  euid: string;
  showDetails?: boolean;
  onEUIDClick?: (euid: string) => void;
  className?: string;
}

const EUIDDisplay: React.FC<EUIDDisplayProps> = ({ 
  euid, 
  showDetails = false,
  onEUIDClick,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [euidData, setEuidData] = useState<any>(null);
  const [_relatedEntities, setRelatedEntities] = useState<any[]>([]);

  useEffect(() => {
    loadEUIDData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [euid]);

  const loadEUIDData = async () => {
    try {
      const data = await euidService.parseEUID(euid);
      if (data) {
        setEuidData(data);
        // Load related entities if showing details
        if (showDetails && (data as any).relationships?.length > 0) {
          // This would load related entity details
          setRelatedEntities((data as any).relationships);
        }
      }
    } catch (error) {
      logger.error('Failed to load EUID data:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(euid);
    setCopied(true);
    toast.success('EUID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type: EntityType) => {
    switch (type) {
      case EntityType.COMPANY:
      case EntityType.NONPROFIT:
        return <Building className="w-4 h-4" />;
      case EntityType.INDIVIDUAL:
        return <User className="w-4 h-4" />;
      case EntityType.DOCUMENT:
      case EntityType.REPORT:
        return <FileText className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: EntityStatus) => {
    switch (status) {
      case EntityStatus.ACTIVE:
        return 'text-green-600 bg-green-50';
      case EntityStatus.HISTORICAL:
        return 'text-yellow-600 bg-yellow-50';
      case EntityStatus.RETIRED:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccessLevelColor = (accessLevel?: AccessLevel) => {
    switch (accessLevel) {
      case AccessLevel.PUBLIC:
        return 'text-blue-600';
      case AccessLevel.RESTRICTED:
        return 'text-orange-600';
      case AccessLevel.VIP:
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!euidData) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md text-sm ${className}`}>
        <Hash className="w-4 h-4 text-gray-400" />
        <span className="font-mono text-gray-600">{euid}</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all hover:shadow-md ${getStatusColor(euidData.status)} ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => onEUIDClick?.(euid)}
      >
        <span className={getAccessLevelColor(euidData.accessLevel)}>
          {getTypeIcon(euidData.type)}
        </span>
        <span className="font-mono font-medium">{euid}</span>
        {euidData.version && (
          <span className="text-xs opacity-75">v{euidData.version}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard();
          }}
          className="ml-1 p-1 hover:bg-white/20 rounded transition-colors"
          title="Copy EUID"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4 text-sm">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-semibold text-gray-900">Entity Details</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(euidData.status)}`}>
                {euidData.status || 'Active'}
              </span>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{euidService.formatEUIDDisplay(euid)}</span>
              </div>
              
              {euidData.accessLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Access Level:</span>
                  <span className={`font-medium ${getAccessLevelColor(euidData.accessLevel)}`}>
                    {euidData.accessLevel === AccessLevel.PUBLIC && '🌐 Public'}
                    {euidData.accessLevel === AccessLevel.RESTRICTED && '🔒 Restricted'}
                    {euidData.accessLevel === AccessLevel.VIP && '⭐ VIP'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">
                  {new Date(euidData.metadata?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              {euidData.metadata?.modifiedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Modified:</span>
                  <span className="font-medium">
                    {new Date(euidData.metadata.modifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Relationships */}
            {euidData.relationships?.length > 0 && (
              <div className="border-t pt-3">
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  Relationships
                </h5>
                <div className="space-y-1.5">
                  {euidData.relationships.slice(0, 3).map((rel: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {rel.type} → {rel.targetEUID}
                      </span>
                      {rel.endDate && (
                        <span className="text-gray-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Expired
                        </span>
                      )}
                    </div>
                  ))}
                  {euidData.relationships.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{euidData.relationships.length - 3} more relationships
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* External Reference */}
            {euidData.metadata?.externalRef && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">External Ref:</span>
                  <span className="font-mono text-gray-600">
                    {euidData.metadata.externalRef}
                  </span>
                </div>
              </div>
            )}

            {/* Status History */}
            {(euidData.status === EntityStatus.HISTORICAL || 
              euidData.status === EntityStatus.RETIRED) && (
              <div className="border-t pt-3 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">
                  {euidData.status === EntityStatus.HISTORICAL && 
                    'This entity has expired but the organization is still active'}
                  {euidData.status === EntityStatus.RETIRED && 
                    'This entity has been retired and is no longer active'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                EUID Details: {euid}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* Detailed view content */}
              {/* This would show full audit history, all relationships, etc. */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EUIDDisplay;