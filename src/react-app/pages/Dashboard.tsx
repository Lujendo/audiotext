import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { FreeTrialDashboard } from '../components/dashboard/FreeTrialDashboard';
import { ProDashboard } from '../components/dashboard/ProDashboard';
import { EnterpriseDashboard } from '../components/dashboard/EnterpriseDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    // Admin always gets admin dashboard
    if (user.role === 'admin') {
      return <AdminDashboard />;
    }

    // Use subscription tier for regular users
    switch (user.subscriptionTier || 'free_trial') {
      case 'free_trial':
        return <FreeTrialDashboard />;
      case 'pro':
        return <ProDashboard />;
      case 'enterprise':
        return <EnterpriseDashboard />;
      default:
        return <FreeTrialDashboard />; // Default to free trial
    }
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};
