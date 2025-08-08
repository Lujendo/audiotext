import React from 'react';
import { 
  BookOpen, 
  Clock, 
  FileText, 
  TrendingUp, 
  Upload,
  Play,
  Download,
  Star
} from 'lucide-react';
import { Button } from '../ui/Button';

export const StudentDashboard: React.FC = () => {
  const recentTranscriptions = [
    { id: 1, title: 'Biology Lecture - Chapter 5', duration: '45:30', date: '2 hours ago', status: 'completed' },
    { id: 2, title: 'History Seminar Discussion', duration: '32:15', date: '1 day ago', status: 'completed' },
    { id: 3, title: 'Math Tutorial Session', duration: '28:45', date: '2 days ago', status: 'completed' },
  ];

  const studyStats = [
    { label: 'Hours Transcribed', value: '24.5', icon: Clock, color: 'text-blue-600' },
    { label: 'Lectures Processed', value: '18', icon: BookOpen, color: 'text-green-600' },
    { label: 'Notes Generated', value: '156', icon: FileText, color: 'text-purple-600' },
    { label: 'Study Streak', value: '7 days', icon: TrendingUp, color: 'text-orange-600' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600">Transform your lectures into searchable notes</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Lecture</h3>
              <p className="text-blue-100 text-sm">Record or upload audio files</p>
            </div>
            <Upload className="h-8 w-8 text-blue-200" />
          </div>
          <Button variant="secondary" className="mt-4 bg-white text-blue-600 hover:bg-blue-50">
            Start Upload
          </Button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Study Notes</h3>
              <p className="text-green-100 text-sm">Review transcribed content</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-200" />
          </div>
          <Button variant="secondary" className="mt-4 bg-white text-green-600 hover:bg-green-50">
            View Notes
          </Button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Search Content</h3>
              <p className="text-purple-100 text-sm">Find specific topics quickly</p>
            </div>
            <FileText className="h-8 w-8 text-purple-200" />
          </div>
          <Button variant="secondary" className="mt-4 bg-white text-purple-600 hover:bg-purple-50">
            Search
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {studyStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-gray-100`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transcriptions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Lectures</h2>
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

      {/* Study Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📚 Study Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Organize by Subject</h4>
            <p className="text-sm text-gray-600">Create folders for different courses to keep your transcriptions organized.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Use Keywords</h4>
            <p className="text-sm text-gray-600">Add tags to your transcriptions to make them easier to find later.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
