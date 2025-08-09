import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
          <Button
            variant="secondary"
            className="mt-4 bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/extract')}
          >
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

      {/* Professional Recent Lectures */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Recent Lectures</h2>
                <p className="text-blue-100">Your transcribed study materials</p>
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
                    <BookOpen className="w-6 h-6 text-white" />
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
                    <span className="text-blue-600 font-medium">Study notes ready</span>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    Lecture transcription ready for note-taking and study. Click to open in the advanced text editor.
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
                    <span>Study</span>
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
              {recentTranscriptions.length} recent lectures
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/extract')}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Record New Lecture</span>
            </Button>
          </div>
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
