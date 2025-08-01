import React from 'react';
import { Users, Clock, Activity } from 'lucide-react';

interface ActiveUser {
  id: string;
  name: string;
  email?: string;
  color: string;
  section?: string;
  lastActive: Date;
  isTyping?: boolean;
}

interface CollaborationIndicatorContentProps {
  activeUsers: ActiveUser[];
  currentUserId?: string;
}

const CollaborationIndicatorContent: React.FC<CollaborationIndicatorContentProps> = ({
  activeUsers,
  currentUserId
}) => {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Active now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const otherUsers = activeUsers.filter(user => user.id !== currentUserId);

  if (otherUsers.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No other users online</p>
      </div>
    );
  }

  return (
    <div className="w-80">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Active Collaborators ({otherUsers.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {otherUsers.map(user => (
          <div 
            key={user.id} 
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.isTyping && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                {user.section && (
                  <p className="text-xs text-gray-500">
                    {user.isTyping ? 'Typing in' : 'Viewing'} {user.section}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {getTimeAgo(user.lastActive)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            Real-time collaboration
          </span>
          <span>Updates live</span>
        </div>
      </div>
    </div>
  );
};

export default CollaborationIndicatorContent;