import React from 'react';
import {
  Users,
  Shield,
  Settings,
  AlertTriangle,
  Zap,
  Database,
  Activity,
  UserCheck
} from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminDashboard: React.FC = () => {
  const systemStats = [
    { label: 'Total Users', value: '2,847', icon: Users, color: 'text-blue-600', change: '+12%' },
    { label: 'Active Sessions', value: '156', icon: Activity, color: 'text-green-600', change: '+8%' },
    { label: 'Storage Used', value: '847 GB', icon: Database, color: 'text-purple-600', change: '+15%' },
    { label: 'System Health', value: '99.8%', icon: Shield, color: 'text-orange-600', change: '+0.1%' },
  ];

  const recentActivity = [
    { id: 1, user: 'john@example.com', action: 'User Registration', time: '2 minutes ago', status: 'success' },
    { id: 2, user: 'sarah@company.com', action: 'File Upload (45MB)', time: '5 minutes ago', status: 'success' },
    { id: 3, user: 'mike@studio.com', action: 'Subscription Upgrade', time: '12 minutes ago', status: 'success' },
    { id: 4, user: 'anna@university.edu', action: 'Failed Login Attempt', time: '18 minutes ago', status: 'warning' },
  ];

  const usersByRole = [
    { role: 'Professional', count: 1247, percentage: 44, color: 'bg-blue-500' },
    { role: 'Student', count: 892, percentage: 31, color: 'bg-green-500' },
    { role: 'Copywriter', count: 456, percentage: 16, color: 'bg-purple-500' },
    { role: 'Video Editor', count: 252, percentage: 9, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and user management</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Shield className="h-8 w-8 text-red-200" />
            <span className="text-xs bg-red-400 px-2 py-1 rounded-full">Admin</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">System Settings</h3>
          <p className="text-red-100 text-sm mb-4">Configure system parameters</p>
          <Button variant="secondary" size="sm" className="bg-white text-red-600 hover:bg-red-50">
            Open Settings
          </Button>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-blue-100 text-sm mb-4">Manage user accounts</p>
          <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
            Manage Users
          </Button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Database className="h-8 w-8 text-green-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Database</h3>
          <p className="text-green-100 text-sm mb-4">Monitor database health</p>
          <Button variant="secondary" size="sm" className="bg-white text-green-600 hover:bg-green-50">
            View DB
          </Button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-purple-200" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-purple-100 text-sm mb-4">System performance</p>
          <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat, index) => {
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
                  <p className="text-xs text-gray-500">vs last week</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {activity.status === 'success' ? (
                          <UserCheck className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{activity.action}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">{activity.user}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution & System Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
            <div className="space-y-4">
              {usersByRole.map((role, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{role.role}</span>
                    <span className="text-sm text-gray-500">{role.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${role.color}`}
                      style={{ width: `${role.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-indigo-200 mr-2" />
              <h3 className="text-lg font-semibold">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-indigo-100 text-sm">API Response Time</span>
                <span className="text-white font-medium">127ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-100 text-sm">Database Queries</span>
                <span className="text-white font-medium">2.3k/min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-100 text-sm">Error Rate</span>
                <span className="text-white font-medium">0.02%</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="mt-4 bg-white text-indigo-600 hover:bg-indigo-50">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
