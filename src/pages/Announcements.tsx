import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

const Announcements = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">OpenEvidence</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Log In
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Sign Up
          </Button>
          <Button variant="ghost" size="sm">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Announcements</h1>
          <p className="text-xl text-gray-600">
            Latest news and updates from OpenEvidence
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  OpenEvidence Partners with Leading Medical Journals
                </h2>
                <p className="text-sm text-gray-500">March 15, 2024</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We're excited to announce strategic content agreements with JAMA Network and 
              The New England Journal of Medicine, providing our users with access to the 
              highest quality medical research and clinical insights.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Enhanced AI Capabilities for Medical Question Answering
                </h2>
                <p className="text-sm text-gray-500">February 28, 2024</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our latest AI model update includes improved understanding of complex medical 
              queries and enhanced ability to synthesize information from multiple sources 
              for more comprehensive answers.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  New Security and Compliance Features
                </h2>
                <p className="text-sm text-gray-500">February 10, 2024</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We've implemented additional security measures and achieved SOC 2 Type II 
              compliance to ensure the highest standards of data protection for healthcare 
              professionals.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Mobile App Beta Launch
                </h2>
                <p className="text-sm text-gray-500">January 20, 2024</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our mobile application is now available in beta for iOS and Android, 
              bringing evidence-based medical intelligence to healthcare professionals 
              on the go.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Announcements;