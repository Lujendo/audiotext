import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  FileText,
  Users,
  Upload,
  Calendar,
  Download,
  Share2,
  BarChart3,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';

export const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const recentMeetings = [
    { id: 1, title: 'Q4 Strategy Meeting', participants: 8, duration: '1:15:30', date: '1 hour ago', status: 'completed' },
    { id: 2, title: 'Client Presentation Review', participants: 5, duration: '45:20', date: '3 hours ago', status: 'completed' },
    { id: 3, title: 'Team Standup', participants: 12, duration: '25:15', date: '1 day ago', status: 'completed' },
  ];

  const businessStats = [
    { label: 'Meeting Hours', value: '156.5', icon: Clock, color: 'text-blue-600', change: '+12%' },
    { label: 'Transcriptions', value: '89', icon: FileText, color: 'text-green-600', change: '+8%' },
    { label: 'Team Members', value: '24', icon: Users, color: 'text-purple-600', change: '+3%' },
    { label: 'Efficiency Score', value: '94%', icon: BarChart3, color: 'text-orange-600', change: '+5%' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Professional Dashboard</h1>
        <p className="text-gray-600">Streamline your business communications and meetings</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Upload className="h-8 w-8 text-blue-200" />
            <span className="text-xs bg-blue-400 px-2 py-1 rounded-full">New</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Meeting</h3>
          <p className="text-blue-100 text-sm mb-4">Record or upload meeting audio</p>
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
            <Calendar className="h-8 w-8 text-green-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Schedule Meeting</h3>
          <p className="text-green-100 text-sm mb-4">Plan and organize meetings</p>
          <Button variant="secondary" size="sm" className="bg-white text-green-600 hover:bg-green-50">
            Schedule
          </Button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Share2 className="h-8 w-8 text-purple-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
          <p className="text-purple-100 text-sm mb-4">Share and collaborate</p>
          <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
            Collaborate
          </Button>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-orange-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-orange-100 text-sm mb-4">View detailed insights</p>
          <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-orange-50">
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {businessStats.map((stat, index) => {
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
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Professional Recent Meetings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Recent Meetings</h2>
                  <p className="text-blue-100">Your transcribed business communications</p>
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
            {recentMeetings.map((meeting) => (
              <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{meeting.participants} participants</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.duration}</span>
                      </span>
                      <span>•</span>
                      <span>{meeting.date}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">Action items ready</span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      Meeting transcription with speaker identification and action items. Click to review and share with your team.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/extract')}
                      className="flex items-center space-x-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Review</span>
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
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
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
                {recentMeetings.length} recent meetings
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/extract')}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Record Meeting</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Most Active Day</span>
                <span className="text-sm font-medium text-gray-900">Tuesday</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Meeting Length</span>
                <span className="text-sm font-medium text-gray-900">47 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Top Keyword</span>
                <span className="text-sm font-medium text-gray-900">"Strategy"</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-indigo-200 mr-2" />
              <h3 className="text-lg font-semibold">Pro Tip</h3>
            </div>
            <p className="text-indigo-100 text-sm">
              Use speaker identification to automatically assign action items to team members.
            </p>
            <Button variant="secondary" size="sm" className="mt-4 bg-white text-indigo-600 hover:bg-indigo-50">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
