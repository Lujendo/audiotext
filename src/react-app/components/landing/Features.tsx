import React from 'react';
import { 
  Mic, 
  FileText, 
  Download, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  Search,
  Clock,
  Palette,
  Share2,
  BarChart3
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'AI-Powered Transcription',
    description: 'Advanced speech recognition with 99% accuracy using Cloudflare Workers AI. Supports multiple languages and accents.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: FileText,
    title: 'Professional Rich Text Editor',
    description: 'Advanced editing tools with formatting, collaboration features, and real-time editing capabilities.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    icon: Download,
    title: 'Multiple Export Formats',
    description: 'Export in PDF, DOCX, TXT, SRT, VTT formats with professional and standard quality options.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Tailored experiences for students, professionals, copywriters, and video editors with specific tools.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with encrypted storage, secure authentication, and compliance standards.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Powered by Cloudflare edge network for ultra-fast processing and global availability.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Transcribe audio in 50+ languages with automatic language detection and translation.',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'AI-powered semantic search across all your transcriptions with instant results.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    icon: Clock,
    title: 'Time-Stamped Segments',
    description: 'Precise timestamps for each segment with speaker identification and confidence scores.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    icon: Palette,
    title: 'Customizable Interface',
    description: 'Personalize your workspace with themes, layouts, and productivity tools.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    icon: Share2,
    title: 'Team Collaboration',
    description: 'Share projects, collaborate in real-time, and manage team permissions effortlessly.',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Track usage, performance metrics, and productivity insights with detailed analytics.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for
            <span className="gradient-text"> Professional Transcription</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools and features designed to streamline your audio-to-text workflow
            and enhance productivity across all use cases.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800">
            <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-primary-700 dark:text-primary-300 font-medium">
              All features included in every plan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
