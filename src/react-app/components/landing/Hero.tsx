import React from 'react';
import { Button } from '../ui/Button';
import { Play, Mic, FileText, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Powered by Cloudflare AI
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Transform{' '}
            <span className="gradient-text">Audio to Text</span>
            <br />
            with Professional Precision
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate audio transcription platform for students, professionals, copywriters, and video editors. 
            Get accurate transcriptions with advanced editing tools and export in multiple formats.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="w-full sm:w-auto">
              <Play className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Mic className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">99% accuracy rate</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Rich Editor</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Professional editing</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Fast Export</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Multiple formats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo video/image placeholder */}
        <div className="mt-16 relative">
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto">
                    <Play className="w-8 h-8 text-primary-600 dark:text-primary-400 ml-1" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    Watch AudioText in Action
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    See how easy it is to transcribe and edit audio
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-200 dark:bg-primary-800/30 rounded-full blur-xl opacity-60"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary-200 dark:bg-secondary-800/30 rounded-full blur-xl opacity-60"></div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Trusted by professionals worldwide
          </p>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            {/* Placeholder for company logos */}
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
