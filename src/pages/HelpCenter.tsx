import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Menu, HelpCircle, Book, Video, MessageCircle } from 'lucide-react';

const HelpCenter = () => {
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
            <span className="text-xl font-semibold text-gray-900">DeepEvidence</span>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600">
            Find answers and get support
          </p>
        </div>

        {/* Quick Help Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <HelpCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
            <p className="text-sm text-gray-600">Common questions and answers</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Book className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
            <p className="text-sm text-gray-600">Step-by-step instructions</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Video className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Learn with video guides</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Get personalized help</p>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Getting Started</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How to ask your first question</h3>
                <p className="text-gray-700">
                  Simply type your medical question in the search box on the homepage and click "Ask for Evidence". 
                  Our AI will analyze your question and provide evidence-based answers with citations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Understanding the results</h3>
                <p className="text-gray-700">
                  Each answer includes a comprehensive response, relevant citations from medical literature, 
                  and suggested follow-up questions to help you explore the topic further.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Creating an account</h3>
                <p className="text-gray-700">
                  While you can use DeepEvidence without an account, creating one allows you to save 
                  your search history and customize your preferences.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">What types of questions can I ask?</h3>
                <p className="text-gray-700">
                  You can ask any medical or healthcare-related question. DeepEvidence works best with 
                  specific clinical questions about treatments, diagnoses, drug interactions, guidelines, 
                  and evidence-based practices.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How current is the information?</h3>
                <p className="text-gray-700">
                  Our database is continuously updated with the latest medical literature, clinical guidelines, 
                  and regulatory information. We prioritize recent publications and current best practices.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Can I use this for patient care decisions?</h3>
                <p className="text-gray-700">
                  DeepEvidence provides evidence-based information to support clinical decision-making, 
                  but it should not replace professional medical judgment or direct patient care protocols.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Is my data secure and private?</h3>
                <p className="text-gray-700">
                  Yes, we maintain strict security and privacy standards. We are HIPAA compliant and 
                  can provide Business Associate Agreements for healthcare organizations.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I cite DeepEvidence in my work?</h3>
                <p className="text-gray-700">
                  While DeepEvidence provides synthesized information, we recommend citing the original 
                  sources provided in our reference lists for academic or professional publications.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Troubleshooting</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search not working properly</h3>
                <p className="text-gray-700">
                  Try refreshing the page, checking your internet connection, or rephrasing your question. 
                  If issues persist, contact our support team.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Slow loading times</h3>
                <p className="text-gray-700">
                  Complex medical questions may take longer to process. If you experience consistently 
                  slow performance, try clearing your browser cache or using a different browser.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account access issues</h3>
                <p className="text-gray-700">
                  If you're having trouble logging in, try resetting your password or contact support 
                  for assistance with account recovery.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Can't find what you're looking for? Our support team is here to help you get the most 
              out of DeepEvidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Contact Support
              </Button>
              <Button variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
