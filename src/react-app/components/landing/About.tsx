import React from 'react';
import { Users, Target, Award, Zap } from 'lucide-react';

const stats = [
  { label: 'Active Users', value: '10,000+', icon: Users },
  { label: 'Accuracy Rate', value: '99.2%', icon: Target },
  { label: 'Languages Supported', value: '50+', icon: Award },
  { label: 'Processing Speed', value: '5x Faster', icon: Zap },
];

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            About AudioText
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing how professionals, students, and creators transform audio content into actionable text with cutting-edge AI technology.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-gray-600 mb-4">
              AudioText was born from the need to make audio content more accessible and actionable. Whether you're a student recording lectures, a professional conducting meetings, or a content creator working with interviews, we believe everyone deserves accurate, fast, and intelligent transcription.
            </p>
            <p className="text-gray-600 mb-4">
              Our AI-powered platform doesn't just transcribe—it understands context, identifies speakers, and helps you extract maximum value from your audio content.
            </p>
            <p className="text-gray-600">
              Built on Cloudflare's global infrastructure, AudioText delivers enterprise-grade security and performance while remaining accessible to individual users.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg mb-3">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Accuracy First</h4>
              <p className="text-gray-600">We prioritize precision in every transcription, ensuring your content is captured exactly as intended.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">User-Centric</h4>
              <p className="text-gray-600">Every feature is designed with our users in mind, from students to enterprise teams.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h4>
              <p className="text-gray-600">We continuously push the boundaries of what's possible with AI and audio processing.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
