import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  Upload,
  Star,
  Crown,
  Users,
  Mic,
  Settings,
  BarChart3,
  Target,
  Share2,
  Edit3,

} from 'lucide-react';
import { Button } from '../ui/Button';

export const ProDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data for Pro user
  const proStats = {
    minutesUsed: 287,
    minutesTotal: 500,
    transcriptionsThisMonth: 24,
    averageAccuracy: 97.2,
    speakerDetectionUsed: 18,
  };

  const recentTranscriptions = [
    { id: 1, title: 'Client Strategy Meeting', duration: '1:15:30', date: '1 hour ago', status: 'completed', speakers: 4, confidence: 98 },
    { id: 2, title: 'Product Demo Recording', duration: '28:45', date: '3 hours ago', status: 'completed', speakers: 2, confidence: 96 },
    { id: 3, title: 'Team Standup Call', duration: '22:15', date: '1 day ago', status: 'completed', speakers: 6, confidence: 95 },
    { id: 4, title: 'Customer Interview', duration: '45:20', date: '2 days ago', status: 'completed', speakers: 2, confidence: 99 },
  ];

  const monthlyStats = [
    { label: 'Minutes Used', value: `${proStats.minutesUsed}/${proStats.minutesTotal}`, icon: Clock, color: 'text-blue-600', change: '+15%' },
    { label: 'Transcriptions', value: proStats.transcriptionsThisMonth.toString(), icon: FileText, color: 'text-green-600', change: '+8%' },
    { label: 'Avg Accuracy', value: `${proStats.averageAccuracy}%`, icon: Target, color: 'text-purple-600', change: '+2%' },
    { label: 'Speaker Detection', value: proStats.speakerDetectionUsed.toString(), icon: Users, color: 'text-orange-600', change: '+12%' },
  ];

  const progressPercentage = (proStats.minutesUsed / proStats.minutesTotal) * 100;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pro Dashboard</h1>
            <p className="text-gray-600">Professional transcription with advanced AI features</p>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg">
            <Crown className="w-5 h-5" />
            <span className="font-medium">Pro Plan</span>
          </div>
        </div>
      </div>

      {/* Pro Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {monthlyStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Progress */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Usage</h3>
          <span className="text-sm text-gray-500">Resets in 12 days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{proStats.minutesUsed} minutes used</span>
          <span>{proStats.minutesTotal - proStats.minutesUsed} minutes remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Professional Recent Transcriptions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Recent Transcriptions</h2>
                  <p className="text-blue-100">Professional AI transcriptions with speaker ID</p>
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
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.status}
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
                      Pro transcription with speaker identification and advanced AI processing. Ready for professional use.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/extract')}
                      className="flex items-center space-x-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                      title="Share"
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
                {recentTranscriptions.length} recent transcriptions
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/extract')}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>New Transcription</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Pro Features & Analytics */}
        <div className="space-y-6">
          {/* Pro Features */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Crown className="w-5 h-5 text-blue-600" />
              <span>Pro Features</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Speaker Identification</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Custom Vocabulary</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority Processing</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Access</span>
                <span className="text-sm font-medium text-blue-600">Available</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/extract')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Mic className="w-4 h-4" />
                <span>Record Audio</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Custom Vocabulary</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analytics')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Analytics</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
