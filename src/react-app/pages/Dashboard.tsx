import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { ProfessionalDashboard } from '../components/dashboard/ProfessionalDashboard';
import { CopywriterDashboard } from '../components/dashboard/CopywriterDashboard';
import { VideoEditorDashboard } from '../components/dashboard/VideoEditorDashboard';

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
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'professional':
        return <ProfessionalDashboard />;
      case 'copywriter':
        return <CopywriterDashboard />;
      case 'video_editor':
        return <VideoEditorDashboard />;
      default:
        return <ProfessionalDashboard />; // Default fallback
    }
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};
