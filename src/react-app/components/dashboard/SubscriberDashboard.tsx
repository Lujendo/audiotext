import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Clock,
  FileText,
  Crown,
  Upload,
  Play,
  Download,
  Star,
  Gift,
  Lock
} from 'lucide-react';
import { Button } from '../ui/Button';

export const SubscriberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const recentTranscriptions = [
    { id: 1, title: 'Weekly Team Meeting', duration: '32:15', date: '1 hour ago', status: 'completed' },
    { id: 2, title: 'Client Call Recording', duration: '18:45', date: '3 hours ago', status: 'completed' },
    { id: 3, title: 'Podcast Interview', duration: '1:05:30', date: '1 day ago', status: 'completed' },
  ];

  const subscriptionStats = [
    { label: 'Minutes Used', value: '847', max: '1000', icon: Clock, color: 'text-blue-600' },
    { label: 'Files This Month', value: '23', max: '50', icon: FileText, color: 'text-green-600' },
    { label: 'Storage Used', value: '2.3 GB', max: '5 GB', icon: Upload, color: 'text-purple-600' },
    { label: 'Days Remaining', value: '18', max: '30', icon: Crown, color: 'text-orange-600' },
  ];

  const premiumFeatures = [
    { name: 'Advanced AI Models', description: 'Access to latest transcription models', available: true },
    { name: 'Speaker Identification', description: 'Automatic speaker detection', available: true },
    { name: 'Custom Vocabulary', description: 'Add industry-specific terms', available: true },
    { name: 'Priority Processing', description: 'Faster transcription queue', available: true },
    { name: 'Export Formats', description: 'Multiple export options', available: true },
    { name: 'Team Collaboration', description: 'Share with team members', available: false },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Subscriber Dashboard</h1>
          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Crown className="w-4 h-4" />
            <span>Premium</span>
          </div>
        </div>
        <p className="text-gray-600">Welcome back! You're making great use of your premium features.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Upload className="h-8 w-8 text-blue-200" />
            <span className="text-xs bg-blue-400 px-2 py-1 rounded-full">Premium</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Audio</h3>
          <p className="text-blue-100 text-sm mb-4">High-quality transcription</p>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/extract')}
          >
            Start Upload
          </Button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Mic className="h-8 w-8 text-green-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Recording</h3>
          <p className="text-green-100 text-sm mb-4">Real-time transcription</p>
          <Button variant="secondary" size="sm" className="bg-white text-green-600 hover:bg-green-50">
            Start Recording
          </Button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-purple-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">My Library</h3>
          <p className="text-purple-100 text-sm mb-4">Browse transcriptions</p>
          <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
            Open Library
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {subscriptionStats.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = stat.max ? (parseInt(stat.value) / parseInt(stat.max)) * 100 : 0;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-100`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-500">{stat.max && `of ${stat.max}`}</span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
              {stat.max && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
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
                  <p className="text-blue-100">Your latest audio extractions</p>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.duration}</span>
                      </span>
                      <span>•</span>
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">Ready to edit</span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      Professional transcription ready for editing and export. Click to open in the advanced text editor.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/extract')}
                      className="flex items-center space-x-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Play className="w-4 h-4" />
                      <span>Open</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
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

        {/* Premium Features & Upgrade */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Features</h3>
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    feature.available ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {feature.available ? (
                      <Star className="w-3 h-3 text-green-600" />
                    ) : (
                      <Lock className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      feature.available ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {feature.name}
                    </p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Gift className="h-6 w-6 text-indigo-200 mr-2" />
              <h3 className="text-lg font-semibold">Upgrade Available</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-4">
              Unlock team collaboration and unlimited storage with our Pro plan.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-indigo-100 text-sm">Current Plan</span>
                <span className="text-white font-medium">Premium</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-100 text-sm">Next Billing</span>
                <span className="text-white font-medium">Jan 15, 2025</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
