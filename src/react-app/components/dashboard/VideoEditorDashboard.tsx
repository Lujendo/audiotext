import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Clock,
  FileText,
  Scissors,
  Upload,
  Play,
  Download,
  Layers,
  TrendingUp,
  Zap,
  Subtitles
} from 'lucide-react';
import { Button } from '../ui/Button';

export const VideoEditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const recentProjects = [
    { id: 1, title: 'Corporate Training Video', type: 'Educational', duration: '1:25:30', date: '1 hour ago', status: 'processing' },
    { id: 2, title: 'Product Demo Walkthrough', type: 'Marketing', duration: '18:45', date: '4 hours ago', status: 'completed' },
    { id: 3, title: 'Interview with CEO', type: 'Interview', duration: '42:15', date: '1 day ago', status: 'completed' },
  ];

  const videoStats = [
    { label: 'Video Hours', value: '234.5', icon: Clock, color: 'text-blue-600', change: '+22%' },
    { label: 'Projects', value: '47', icon: Video, color: 'text-green-600', change: '+12%' },
    { label: 'Subtitles Created', value: '156', icon: Subtitles, color: 'text-purple-600', change: '+28%' },
    { label: 'Export Quality', value: '99.2%', icon: TrendingUp, color: 'text-orange-600', change: '+1%' },
  ];

  const exportFormats = [
    { name: 'SRT Subtitles', count: 89, icon: Subtitles, color: 'bg-blue-100 text-blue-600' },
    { name: 'VTT Captions', count: 67, icon: FileText, color: 'bg-green-100 text-green-600' },
    { name: 'Transcript PDF', count: 124, icon: FileText, color: 'bg-purple-100 text-purple-600' },
    { name: 'Edit Scripts', count: 43, icon: Scissors, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Editor Dashboard</h1>
        <p className="text-gray-600">Create perfect subtitles and transcripts for your video content</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Upload className="h-8 w-8 text-blue-200" />
            <span className="text-xs bg-blue-400 px-2 py-1 rounded-full">Fast</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Video</h3>
          <p className="text-blue-100 text-sm mb-4">Extract audio from video</p>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/extract')}
          >
            Upload Video
          </Button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Subtitles className="h-8 w-8 text-green-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Generate Subtitles</h3>
          <p className="text-green-100 text-sm mb-4">Auto-sync with video</p>
          <Button variant="secondary" size="sm" className="bg-white text-green-600 hover:bg-green-50">
            Create SRT
          </Button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Scissors className="h-8 w-8 text-purple-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Edit Timeline</h3>
          <p className="text-purple-100 text-sm mb-4">Precise timing control</p>
          <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
            Open Editor
          </Button>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Layers className="h-8 w-8 text-orange-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Batch Export</h3>
          <p className="text-orange-100 text-sm mb-4">Multiple formats</p>
          <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-orange-50">
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {videoStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <p className="text-xs text-gray-500">this month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Video Projects</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentProjects.map((project) => (
              <div key={project.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Video className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{project.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{project.type}</span>
                        <span className="text-sm text-gray-500">{project.duration}</span>
                        <span className="text-sm text-gray-500">{project.date}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
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

        {/* Export Formats & Tips */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Formats</h3>
            <div className="space-y-3">
              {exportFormats.map((format, index) => {
                const Icon = format.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${format.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{format.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{format.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-cyan-200 mr-2" />
              <h3 className="text-lg font-semibold">Pro Tip</h3>
            </div>
            <p className="text-cyan-100 text-sm mb-4">
              Use our AI-powered speaker detection to automatically create multi-speaker subtitle tracks.
            </p>
            <Button variant="secondary" size="sm" className="bg-white text-cyan-600 hover:bg-cyan-50">
              Try Speaker ID
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Processing Time</span>
                <span className="text-sm font-medium text-gray-900">2.3 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accuracy Rate</span>
                <span className="text-sm font-medium text-gray-900">99.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Most Used Format</span>
                <span className="text-sm font-medium text-gray-900">SRT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
