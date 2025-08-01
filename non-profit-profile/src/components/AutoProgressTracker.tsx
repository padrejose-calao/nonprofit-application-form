import React, { useState, useEffect } from 'react';
import {
  TrendingUp, CheckCircle, AlertCircle, Clock,
  Target, Award, Zap, Star, BarChart3, Activity,
  Calendar, Flag, Gauge, Trophy, Sparkles, X
} from 'lucide-react';
import { toast } from 'react-toastify';

interface AutoProgressTrackerProps {
  sectionProgress: { [key: string]: number };
  currentSection: string;
  formStartTime: Date;
  onClose?: () => void;
}

interface Milestone {
  percentage: number;
  title: string;
  description: string;
  reward: string;
  icon: React.ElementType;
  achieved: boolean;
}

const AutoProgressTracker: React.FC<AutoProgressTrackerProps> = ({
  sectionProgress,
  currentSection,
  formStartTime,
  onClose
}) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [lastProgress, setLastProgress] = useState(0);
  const [progressVelocity, setProgressVelocity] = useState(0);
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);
  const [achievedMilestones, setAchievedMilestones] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const milestones: Milestone[] = [
    {
      percentage: 10,
      title: "Getting Started!",
      description: "You've begun your nonprofit profile",
      reward: "🚀 Quick Start Badge",
      icon: Zap,
      achieved: false
    },
    {
      percentage: 25,
      title: "Quarter Way There!",
      description: "25% of your profile is complete",
      reward: "🌟 Rising Star Badge",
      icon: Star,
      achieved: false
    },
    {
      percentage: 50,
      title: "Halfway Hero!",
      description: "You're 50% complete - keep going!",
      reward: "🏆 Persistence Trophy",
      icon: Trophy,
      achieved: false
    },
    {
      percentage: 75,
      title: "Almost There!",
      description: "75% complete - the finish line is in sight!",
      reward: "💎 Diamond Status",
      icon: Award,
      achieved: false
    },
    {
      percentage: 100,
      title: "Profile Champion!",
      description: "Congratulations! Your profile is complete!",
      reward: "👑 Completion Crown",
      icon: CheckCircle,
      achieved: false
    }
  ];

  // Calculate overall progress
  useEffect(() => {
    const sections = Object.keys(sectionProgress);
    const totalProgress = sections.reduce((sum, section) => sum + (sectionProgress[section] || 0), 0);
    const avgProgress = sections.length > 0 ? Math.round(totalProgress / sections.length) : 0;
    
    // Calculate velocity (progress per minute)
    const timeDiff = (new Date().getTime() - formStartTime.getTime()) / 1000 / 60; // in minutes
    const velocity = timeDiff > 0 ? (avgProgress - lastProgress) / timeDiff : 0;
    
    setProgressVelocity(velocity);
    setLastProgress(overallProgress);
    setOverallProgress(avgProgress);

    // Estimate completion time
    if (velocity > 0 && avgProgress < 100) {
      const remainingProgress = 100 - avgProgress;
      const estimatedMinutes = remainingProgress / velocity;
      const completionTime = new Date();
      completionTime.setMinutes(completionTime.getMinutes() + estimatedMinutes);
      setEstimatedCompletion(completionTime);
    }

    // Check for new milestones
    milestones.forEach((milestone, index) => {
      if (avgProgress >= milestone.percentage && !achievedMilestones.includes(index)) {
        setAchievedMilestones(prev => [...prev, index]);
        celebrateMilestone(milestone);
      }
    });
  }, [sectionProgress, formStartTime]);

  const celebrateMilestone = (milestone: Milestone) => {
    setShowCelebration(true);
    toast.success(
      <div className="flex items-center">
        <milestone.icon className="w-6 h-6 mr-2" />
        <div>
          <div className="font-bold">{milestone.title}</div>
          <div className="text-sm">{milestone.reward}</div>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: 5000,
        className: 'milestone-toast'
      }
    );
    
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getVelocityIndicator = () => {
    if (progressVelocity > 5) return { icon: Zap, color: 'text-green-600', text: 'Lightning Fast!' };
    if (progressVelocity > 2) return { icon: TrendingUp, color: 'text-blue-600', text: 'Great Pace!' };
    if (progressVelocity > 0) return { icon: Activity, color: 'text-yellow-600', text: 'Steady Progress' };
    return { icon: Clock, color: 'text-gray-600', text: 'Take Your Time' };
  };

  const velocityInfo = getVelocityIndicator();

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Progress Tracker</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Gauge className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{overallProgress}%</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close Progress Tracker"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${getProgressColor(overallProgress)}`}
            style={{ width: `${overallProgress}%` }}
          >
            {showCelebration && (
              <div className="h-full bg-white bg-opacity-50 animate-pulse" />
            )}
          </div>
        </div>
        
        {/* Milestone Markers */}
        <div className="absolute inset-0 flex justify-between items-center">
          {milestones.map((milestone, index) => {
            const IconComponent = milestone.icon;
            const isAchieved = achievedMilestones.includes(index);
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${milestone.percentage}%` }}
                title={milestone.title}
              >
                <div className={`
                  w-4 h-4 rounded-full border-2 
                  ${isAchieved ? 'bg-white border-green-500' : 'bg-gray-300 border-gray-400'}
                  ${overallProgress >= milestone.percentage ? 'scale-125' : ''}
                  transition-all duration-300
                `}>
                  {isAchieved && (
                    <IconComponent className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Velocity Indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <velocityInfo.icon className={`w-4 h-4 ${velocityInfo.color}`} />
          <span className={`text-sm font-medium ${velocityInfo.color}`}>
            {velocityInfo.text}
          </span>
        </div>
        {estimatedCompletion && overallProgress < 100 && (
          <div className="text-xs text-gray-600">
            ETA: {estimatedCompletion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Section Progress */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 mb-1">Current Section Progress</div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 capitalize">
            {currentSection.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  sectionProgress[currentSection] >= 75 ? 'bg-green-500' :
                  sectionProgress[currentSection] >= 50 ? 'bg-blue-500' :
                  sectionProgress[currentSection] >= 25 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${sectionProgress[currentSection] || 0}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700">
              {sectionProgress[currentSection] || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {overallProgress < 100 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Next milestone:</span>
            <span className="font-medium text-gray-900">
              {milestones.find(m => m.percentage > overallProgress)?.percentage || 100}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {milestones.find(m => m.percentage > overallProgress)?.reward}
          </div>
        </div>
      )}

      {/* Celebration Effect */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <Sparkles
              key={i}
              className={`absolute w-4 h-4 text-yellow-400 animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoProgressTracker;