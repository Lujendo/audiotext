import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

export const DevCredentials: React.FC = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const devUsers = [
    { role: 'Admin', email: 'admin@audiotext.com', password: 'Admin123!', description: 'System administration and management' },
    { role: 'Subscriber', email: 'subscriber@audiotext.com', password: 'Sub123!', description: 'Premium features and priority support' },
    { role: 'Student', email: 'student@audiotext.com', password: 'Student123!', description: 'Academic research and learning' },
    { role: 'Professional', email: 'pro@audiotext.com', password: 'Pro123!', description: 'Business and professional use' },
    { role: 'Copywriter', email: 'writer@audiotext.com', password: 'Writer123!', description: 'Content creation and writing' },
    { role: 'Video Editor', email: 'editor@audiotext.com', password: 'Editor123!', description: 'Video production and editing' },
  ];

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">Development Test Accounts</h3>
        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
        </button>
      </div>
      
      <p className="text-blue-700 text-sm mb-4">
        Use these pre-configured accounts to test different user roles and dashboard experiences.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devUsers.map((user, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{user.role}</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Test Account
              </span>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">{user.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.email}</code>
                  <button
                    onClick={() => copyToClipboard(user.email, index * 2)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedIndex === index * 2 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password:</span>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {showPasswords ? user.password : '••••••••'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.password, index * 2 + 1)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedIndex === index * 2 + 1 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-xs">
          <strong>Note:</strong> These are development-only credentials. In production, all passwords would be properly hashed and stored securely.
        </p>
      </div>
    </div>
  );
};
