import React, { useState } from 'react';
import { 
  Eye, 
  Brain, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Bookmark,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';

interface NavigationButton {
  id: string;
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  dismissible?: boolean;
  hasMenu?: boolean;
  color?: string;
  component?: React.ReactNode;
}

interface BottomNavigationBarProps {
  onLogout: () => void;
  showCollaborators?: boolean;
  isOffline?: boolean;
  onBookmarkClick?: () => void;
  currentModule?: string;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  onLogout,
  showCollaborators = true,
  isOffline = false,
  onBookmarkClick,
  currentModule
}) => {
  const [hiddenButtons, setHiddenButtons] = useState<Set<string>>(new Set());
  const [showMenus, setShowMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (buttonId: string) => {
    setShowMenus(prev => ({
      ...prev,
      [buttonId]: !prev[buttonId]
    }));
  };

  const dismissButton = (buttonId: string) => {
    setHiddenButtons(prev => new Set(prev).add(buttonId));
  };

  const buttons: NavigationButton[] = [
    {
      id: 'bookmark',
      icon: <Bookmark className="w-6 h-6" />,
      title: 'Quick Links',
      onClick: onBookmarkClick,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'collaborators',
      icon: <Users className="w-6 h-6" />,
      title: 'Active Collaborators',
      dismissible: true,
      hasMenu: true,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'forward',
      icon: <ChevronRight className="w-6 h-6" />,
      title: 'Forward',
      onClick: () => window.history.forward(),
      color: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      id: 'back',
      icon: <ChevronLeft className="w-6 h-6" />,
      title: 'Back',
      onClick: () => window.history.back(),
      color: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      id: 'logout',
      icon: <LogOut className="w-6 h-6" />,
      title: 'Logout',
      onClick: onLogout,
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'ai-assistant',
      icon: <Brain className="w-6 h-6" />,
      title: 'AI Assistant',
      dismissible: true,
      hasMenu: true,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'visibility',
      icon: <Eye className="w-6 h-6" />,
      title: 'Widget Settings',
      hasMenu: true,
      color: 'bg-gray-700 hover:bg-gray-800'
    },
    {
      id: 'connection',
      icon: isOffline ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6" />,
      title: isOffline ? 'Offline' : 'Online',
      dismissible: true,
      color: isOffline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
    }
  ];

  const visibleButtons = buttons.filter(btn => !hiddenButtons.has(btn.id));

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 z-50">
      {visibleButtons.reverse().map((button, index) => (
        <div key={button.id} className="relative">
          {/* Main Button */}
          <button
            onClick={() => {
              if (button.onClick) {
                button.onClick();
              } else if (button.hasMenu) {
                toggleMenu(button.id);
              }
            }}
            className={`
              w-14 h-14 rounded-full shadow-lg hover:shadow-xl 
              transition-all duration-200 flex items-center justify-center 
              hover:scale-110 text-white relative
              ${button.color || 'bg-gray-600 hover:bg-gray-700'}
            `}
            title={button.title}
          >
            {button.icon}
            
            {/* Dismiss X button */}
            {button.dismissible && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissButton(button.id);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 
                          rounded-full flex items-center justify-center transition-colors"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </button>

          {/* Dropdown Menu */}
          {button.hasMenu && showMenus[button.id] && (
            <div className="absolute bottom-16 right-0 mb-2">
              {button.component || (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-2">{button.title}</h3>
                  <p className="text-sm text-gray-600">Menu content here</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BottomNavigationBar;