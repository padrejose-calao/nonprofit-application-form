import React, { useState, useEffect } from 'react';
import { Users, Circle, Eye, Edit3, Lock } from 'lucide-react';
import { collaborationService } from '../services/realtimeCollaborationService';

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  color: string;
  lastActivity: Date;
  currentSection?: string;
}

interface CollaborationIndicatorProps {
  organizationId: string;
  userId: string;
  userName: string;
}

const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({
  organizationId,
  userId,
  userName
}) => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    // Initialize collaboration service
    collaborationService.initialize(organizationId, userId, userName);

    // Set up event listeners
    const handleUserJoined = (user: ActiveUser) => {
      setActiveUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
      setRecentActivity(prev => [`${user.name} joined`, ...prev].slice(0, 5));
    };

    const handleUserLeft = (userId: string) => {
      setActiveUsers(prev => prev.filter(u => u.id !== userId));
      const user = activeUsers.find(u => u.id === userId);
      if (user) {
        setRecentActivity(prev => [`${user.name} left`, ...prev].slice(0, 5));
      }
    };

    const handleFieldUpdated = (event: unknown) => {
      const typedEvent = event as any;
      setRecentActivity(prev => 
        [`${typedEvent.userName} updated ${typedEvent.fieldId}`, ...prev].slice(0, 5)
      );
    };

    collaborationService.on('userJoined', handleUserJoined);
    collaborationService.on('userLeft', handleUserLeft);
    collaborationService.on('fieldUpdated', handleFieldUpdated);

    // Load initial active users
    setActiveUsers(collaborationService.getActiveUsers());

    // Update active users periodically
    const interval = setInterval(() => {
      setActiveUsers(collaborationService.getActiveUsers());
    }, 10000);

    return () => {
      collaborationService.off('userJoined', handleUserJoined);
      collaborationService.off('userLeft', handleUserLeft);
      collaborationService.off('fieldUpdated', handleFieldUpdated);
      clearInterval(interval);
      collaborationService.cleanup();
    };
  }, [organizationId, userId, userName]);

  const getSectionName = (section?: string): string => {
    if (!section) return 'Unknown';
    return section.split(/(?=[A-Z])/).join(' ');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 hover:shadow-xl transition-shadow"
      >
        <Users className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium">
          {activeUsers.length + 1} Active
        </span>
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 3).map(user => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {activeUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Active Collaborators</h3>
            <p className="text-xs text-gray-600 mt-1">
              Real-time collaboration enabled
            </p>
          </div>

          {/* Active Users List */}
          <div className="max-h-60 overflow-y-auto">
            {/* Current User */}
            <div className="px-4 py-3 border-b bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Circle
                    className="w-3 h-3 text-green-500 fill-current"
                  />
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#4ECDC4' }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {userName} (You)
                    </p>
                    <p className="text-xs text-gray-600">
                      Active now
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Users */}
            {activeUsers.map(user => (
              <div key={user.id} className="px-4 py-3 border-b hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Circle
                      className="w-3 h-3 text-green-500 fill-current"
                    />
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {user.currentSection && (
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-3 h-3" />
                            {getSectionName(user.currentSection)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.lastActivity).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {activeUsers.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No other users currently active
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-t">
                <h4 className="text-xs font-medium text-gray-700">
                  Recent Activity
                </h4>
              </div>
              <div className="px-4 py-2 space-y-1 max-h-32 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    {activity}
                  </p>
                ))}
              </div>
            </>
          )}

          {/* Collaboration Tips */}
          <div className="p-3 bg-blue-50 border-t">
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Collaboration Mode Active</p>
                <p>Changes are synced in real-time. Locked fields show</p>
                <p className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3" />
                  when being edited by others.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationIndicator;