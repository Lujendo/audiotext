import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  Upload,
  Play,
  Download,
  Gift,
  Zap,
  Crown,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Timer,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const FreeTrialDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data for free trial user
  const trialStats = {
    minutesUsed: 12,
    minutesTotal: 30,
    daysLeft: 5,
    transcriptionsCount: 3,
  };

  const recentTranscriptions = [
    { id: 1, title: 'Sample Meeting Recording', duration: '8:30', date: '2 hours ago', status: 'completed', wordsCount: 1250 },
    { id: 2, title: 'Voice Memo Test', duration: '3:45', date: '1 day ago', status: 'completed', wordsCount: 580 },
  ];

  const freeTrialFeatures = [
    { name: '30 minutes transcription', included: true },
    { name: 'Basic AI transcription', included: true },
    { name: 'Export to TXT, SRT', included: true },
    { name: 'Web app access', included: true },
    { name: 'Speaker identification', included: false },
    { name: 'Custom vocabulary', included: false },
    { name: 'API access', included: false },
    { name: 'Priority support', included: false },
  ];

  const progressPercentage = (trialStats.minutesUsed / trialStats.minutesTotal) * 100;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Free Trial Dashboard</h1>
            <p className="text-gray-600">Explore AudioText with your 7-day free trial</p>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg">
            <Gift className="w-5 h-5" />
            <span className="font-medium">{trialStats.daysLeft} days left</span>
          </div>
        </div>
      </div>

      {/* Trial Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Minutes Used</p>
                <p className="text-2xl font-bold text-gray-900">{trialStats.minutesUsed}/{trialStats.minutesTotal}</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{Math.round(progressPercentage)}% of trial used</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transcriptions</p>
              <p className="text-2xl font-bold text-gray-900">{trialStats.transcriptionsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="w-6 h-6" />
            <div>
              <p className="text-sm font-medium text-orange-100">Trial Status</p>
              <p className="text-xl font-bold">Active</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/pricing')}
            className="w-full mt-3 bg-white text-orange-600 hover:bg-orange-50"
          >
            Upgrade Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Professional Recent Transcriptions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Your Transcriptions</h2>
                  <p className="text-blue-100">Free trial audio extractions</p>
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
          
          {recentTranscriptions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transcriptions yet</h3>
              <p className="text-gray-500 mb-6">Upload your first audio file to get started with your free trial</p>
              <Button
                variant="primary"
                onClick={() => navigate('/extract')}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Audio File</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {recentTranscriptions.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                          <span>{item.wordsCount} words</span>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Ready to edit</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Free trial transcription ready for editing and export. Experience the power of AI transcription.
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
                          <span>Open</span>
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
                    {recentTranscriptions.length} transcriptions in trial
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/extract')}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>New Transcription</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Trial Features & Upgrade */}
        <div className="space-y-6">
          {/* Trial Progress */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <span>Trial Progress</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Minutes Used</span>
                  <span className="font-medium">{trialStats.minutesUsed}/{trialStats.minutesTotal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trial Expires</span>
                <span className="font-medium text-orange-600">{trialStats.daysLeft} days left</span>
              </div>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Trial Features</span>
            </h3>
            <div className="space-y-3">
              {freeTrialFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {feature.included ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => navigate('/pricing')}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Unlock unlimited transcription and advanced features
              </p>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>Quick Start</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-gray-700">Upload your audio file</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-gray-700">AI transcribes automatically</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-gray-700">Edit and export your text</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/extract')}
              className="w-full mt-4 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Start Transcribing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
