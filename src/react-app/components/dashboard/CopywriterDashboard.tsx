import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenTool,
  Clock,
  FileText,
  Target,
  Upload,
  Edit3,
  Download,
  Lightbulb,
  TrendingUp,
  Zap,
  BookOpen,
  Sparkles,
  Star,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const CopywriterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const recentProjects = [
    { id: 1, title: 'Product Launch Campaign', type: 'Interview', duration: '35:20', date: '2 hours ago', status: 'editing' },
    { id: 2, title: 'Customer Testimonials', type: 'Recording', duration: '28:45', date: '5 hours ago', status: 'completed' },
    { id: 3, title: 'Brand Story Interview', type: 'Interview', duration: '52:10', date: '1 day ago', status: 'completed' },
  ];

  const contentStats = [
    { label: 'Words Generated', value: '45.2K', icon: PenTool, color: 'text-blue-600', change: '+18%' },
    { label: 'Projects Active', value: '12', icon: FileText, color: 'text-green-600', change: '+3%' },
    { label: 'Content Hours', value: '89.5', icon: Clock, color: 'text-purple-600', change: '+15%' },
    { label: 'Client Satisfaction', value: '98%', icon: Target, color: 'text-orange-600', change: '+2%' },
  ];

  const contentTypes = [
    { name: 'Blog Posts', count: 24, icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    { name: 'Social Media', count: 156, icon: Sparkles, color: 'bg-green-100 text-green-600' },
    { name: 'Email Campaigns', count: 18, icon: Target, color: 'bg-purple-100 text-purple-600' },
    { name: 'Product Descriptions', count: 67, icon: PenTool, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Copywriter Dashboard</h1>
        <p className="text-gray-600">Transform interviews and recordings into compelling content</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Upload className="h-8 w-8 text-blue-200" />
            <span className="text-xs bg-blue-400 px-2 py-1 rounded-full">Quick</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Interview</h3>
          <p className="text-blue-100 text-sm mb-4">Record client interviews</p>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/extract')}
          >
            Start Recording
          </Button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Edit3 className="h-8 w-8 text-green-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Content Editor</h3>
          <p className="text-green-100 text-sm mb-4">Edit and refine content</p>
          <Button variant="secondary" size="sm" className="bg-white text-green-600 hover:bg-green-50">
            Open Editor
          </Button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Lightbulb className="h-8 w-8 text-purple-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Suggestions</h3>
          <p className="text-purple-100 text-sm mb-4">Get content ideas</p>
          <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
            Get Ideas
          </Button>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Performance</h3>
          <p className="text-orange-100 text-sm mb-4">Track content metrics</p>
          <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-orange-50">
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {contentStats.map((stat, index) => {
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
        {/* Professional Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PenTool className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Recent Projects</h2>
                  <p className="text-purple-100">Your creative content transcriptions</p>
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
            {recentProjects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <PenTool className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'editing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{project.type}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{project.duration}</span>
                      </span>
                      <span>•</span>
                      <span>{project.date}</span>
                      <span>•</span>
                      <span className="text-purple-600 font-medium">Content ready</span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      Creative content transcription ready for copywriting and editing. Transform into compelling marketing copy.
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
                      <span>Edit</span>
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
                {recentProjects.length} recent projects
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/extract')}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>New Project</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Types & Tips */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Types</h3>
            <div className="space-y-3">
              {contentTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{type.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-pink-200 mr-2" />
              <h3 className="text-lg font-semibold">Writing Tip</h3>
            </div>
            <p className="text-pink-100 text-sm mb-4">
              Use the AI-powered content suggestions to overcome writer's block and generate fresh ideas.
            </p>
            <Button variant="secondary" size="sm" className="bg-white text-pink-600 hover:bg-pink-50">
              Try AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
