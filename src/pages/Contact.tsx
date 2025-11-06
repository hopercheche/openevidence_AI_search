import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Menu, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Get in touch with our team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-700 mb-4">
              For general inquiries and support questions
            </p>
            <p className="text-blue-600 font-medium">support@openevidence.com</p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              <Phone className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Available Monday-Friday, 9 AM - 6 PM EST
            </p>
            <p className="text-blue-600 font-medium">+1 (555) 123-4567</p>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Specialized Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Inquiries</h3>
                <p className="text-gray-700 mb-2">For enterprise and institutional sales</p>
                <p className="text-blue-600">sales@openevidence.com</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Partnership</h3>
                <p className="text-gray-700 mb-2">For partnership opportunities</p>
                <p className="text-blue-600">partnerships@openevidence.com</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security & Compliance</h3>
                <p className="text-gray-700 mb-2">For security and HIPAA inquiries</p>
                <p className="text-blue-600">security@openevidence.com</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Media & Press</h3>
                <p className="text-gray-700 mb-2">For media and press inquiries</p>
                <p className="text-blue-600">press@openevidence.com</p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Office Location</h2>
            </div>
            <div className="text-gray-700">
              <p>DeepEvidence Inc.</p>
              <p>123 Medical Center Drive</p>
              <p>Suite 456</p>
              <p>San Francisco, CA 94102</p>
              <p>United States</p>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I get started with DeepEvidence?</h3>
                <p className="text-gray-700">
                  Simply create a free account and start asking medical questions. No setup required.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Is DeepEvidence HIPAA compliant?</h3>
                <p className="text-gray-700">
                  Yes, we offer HIPAA-compliant services and can provide Business Associate Agreements for healthcare organizations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">What sources does DeepEvidence use?</h3>
                <p className="text-gray-700">
                  We synthesize information from peer-reviewed medical literature, clinical guidelines, FDA approvals, and other authoritative medical sources.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Immediate Help?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              For urgent technical issues or critical support needs, please use our priority support channel.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Priority Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
