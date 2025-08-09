import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  Upload,
  Star,
  Users,
  Settings,
  BarChart3,
  Shield,
  Activity,
  Share2,
  Edit3,
  Building,
  Brain,
  Infinity,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const EnterpriseDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data for Enterprise user
  const enterpriseStats = {
    minutesUsedThisMonth: 2847,
    totalTeamMembers: 24,
    transcriptionsThisMonth: 156,
    averageAccuracy: 98.7,
    customModelsActive: 3,
    apiCallsThisMonth: 1250,
  };

  const recentTranscriptions = [
    { id: 1, title: 'Board Meeting Q4 Review', duration: '2:15:30', date: '30 min ago', status: 'completed', speakers: 8, team: 'Executive', confidence: 99 },
    { id: 2, title: 'Product Strategy Session', duration: '1:28:45', date: '2 hours ago', status: 'completed', speakers: 12, team: 'Product', confidence: 98 },
    { id: 3, title: 'Customer Success Call', duration: '45:20', date: '4 hours ago', status: 'completed', speakers: 4, team: 'Sales', confidence: 97 },
    { id: 4, title: 'Engineering Standup', duration: '22:15', date: '1 day ago', status: 'completed', speakers: 15, team: 'Engineering', confidence: 96 },
  ];

  const enterpriseMetrics = [
    { label: 'Monthly Usage', value: `${enterpriseStats.minutesUsedThisMonth}m`, icon: Infinity, color: 'text-blue-600', change: '+22%' },
    { label: 'Team Members', value: enterpriseStats.totalTeamMembers.toString(), icon: Users, color: 'text-green-600', change: '+3' },
    { label: 'Transcriptions', value: enterpriseStats.transcriptionsThisMonth.toString(), icon: FileText, color: 'text-purple-600', change: '+18%' },
    { label: 'System Accuracy', value: `${enterpriseStats.averageAccuracy}%`, icon: Brain, color: 'text-orange-600', change: '+1.2%' },
  ];

  const teamStats = [
    { team: 'Executive', transcriptions: 23, minutes: 456, color: 'bg-blue-500' },
    { team: 'Product', transcriptions: 45, minutes: 892, color: 'bg-green-500' },
    { team: 'Sales', transcriptions: 38, minutes: 734, color: 'bg-purple-500' },
    { team: 'Engineering', transcriptions: 50, minutes: 765, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Dashboard</h1>
            <p className="text-gray-600">Advanced team collaboration and unlimited transcription</p>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg">
            <Building className="w-5 h-5" />
            <span className="font-medium">Enterprise</span>
          </div>
        </div>
      </div>

      {/* Enterprise Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {enterpriseMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{metric.change}</span>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Usage Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Usage Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {teamStats.map((team, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                <span className="font-medium text-gray-900">{team.team}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Transcriptions:</span>
                  <span className="font-medium">{team.transcriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Minutes:</span>
                  <span className="font-medium">{team.minutes}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Professional Recent Transcriptions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Team Transcriptions</h2>
                  <p className="text-purple-100">Enterprise AI with custom training</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/extract')}
              >
                View All
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTranscriptions.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.team}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.duration}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{item.speakers} speakers</span>
                      </span>
                      <span>•</span>
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-green-600 font-medium">{item.confidence}% accuracy</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Enterprise transcription with custom AI training and team collaboration features.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/extract')}
                      className="flex items-center space-x-1 text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Collaborate</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                      title="Share with team"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      title="Favorite"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {recentTranscriptions.length} recent team transcriptions
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/extract')}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Team Transcription</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enterprise Features & Team Management */}
        <div className="space-y-6">
          {/* Enterprise Features */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span>Enterprise Features</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Custom AI Training</span>
                <span className="text-sm font-medium text-green-600">{enterpriseStats.customModelsActive} models</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Team Collaboration</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">White-label Options</span>
                <span className="text-sm font-medium text-blue-600">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SLA Guarantee</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Calls</span>
                <span className="text-sm font-medium text-blue-600">{enterpriseStats.apiCallsThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Team Management</span>
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/team')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Manage Team</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analytics')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Team Analytics</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Enterprise Settings</span>
              </Button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>System Health</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Uptime</span>
                <span className="text-sm font-medium text-green-600">99.98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processing Speed</span>
                <span className="text-sm font-medium text-green-600">2.3x faster</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Security</span>
                <span className="text-sm font-medium text-green-600">SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
