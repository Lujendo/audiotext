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
        {/* Recent Transcriptions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transcriptions</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTranscriptions.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Play className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{item.duration}</span>
                        <span className="text-sm text-gray-500">{item.date}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
