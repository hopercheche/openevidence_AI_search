import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

const About = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About OpenEvidence</h1>
          <p className="text-xl text-gray-600">
            Empowering healthcare professionals with evidence-based medical intelligence
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              OpenEvidence is dedicated to providing healthcare professionals with instant access to 
              evidence-based medical information. We leverage advanced AI technology to synthesize 
              the latest medical literature, clinical guidelines, and regulatory information to help 
              clinicians make informed decisions at the point of care.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Evidence Synthesis</h3>
                <p className="text-gray-700">
                  We analyze thousands of medical publications, guidelines, and regulatory documents 
                  to provide comprehensive, evidence-based answers to clinical questions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Updates</h3>
                <p className="text-gray-700">
                  Our platform continuously monitors new medical literature and updates to ensure 
                  healthcare professionals have access to the most current information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Clinical Decision Support</h3>
                <p className="text-gray-700">
                  We provide actionable insights that help clinicians make better-informed decisions 
                  for their patients, improving outcomes and reducing uncertainty.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Partnerships</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              OpenEvidence has established strategic content agreements with leading medical publishers 
              to ensure comprehensive access to high-quality medical literature:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• JAMA Network - Access to premier medical research and clinical insights</li>
              <li>• The New England Journal of Medicine - Leading medical journal content</li>
              <li>• FDA and CDC Guidelines - Regulatory and public health information</li>
              <li>• Cochrane Database - Systematic reviews and meta-analyses</li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology & Innovation</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform combines natural language processing, machine learning, and medical 
              expertise to deliver accurate, contextual answers to complex medical questions. 
              We continuously improve our algorithms to provide the most relevant and reliable 
              information for healthcare professionals.
            </p>
          </Card>

          <Card className="p-8 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Join thousands of healthcare professionals who trust OpenEvidence for their 
              clinical decision-making needs. Experience the power of evidence-based medicine 
              at your fingertips.
            </p>
            <div className="flex space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;