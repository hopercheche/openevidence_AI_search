import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

const BAA = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Associate Agreement</h1>
          <p className="text-lg text-gray-600">
            HIPAA Compliance for Healthcare Organizations
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-8 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">HIPAA Compliance Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              DeepEvidence is committed to maintaining the highest standards of data protection 
              and privacy for healthcare organizations. Our Business Associate Agreement (BAA) 
              ensures full compliance with HIPAA regulations for the handling of Protected Health 
              Information (PHI).
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is a Business Associate Agreement?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A Business Associate Agreement (BAA) is a written contract between a HIPAA-covered 
              entity and a business associate. The contract safeguards protected health information 
              (PHI) in accordance with HIPAA requirements.
            </p>
            <p className="text-gray-700 leading-relaxed">
              As a business associate, DeepEvidence agrees to implement appropriate safeguards 
              to protect the confidentiality, integrity, and availability of PHI that we may 
              create, receive, maintain, or transmit on behalf of covered entities.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our HIPAA Commitments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Protection</h3>
                <p className="text-gray-700">
                  We implement administrative, physical, and technical safeguards to protect PHI 
                  from unauthorized access, use, or disclosure.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Controls</h3>
                <p className="text-gray-700">
                  Only authorized personnel have access to PHI, and all access is logged and monitored.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Encryption</h3>
                <p className="text-gray-700">
                  All PHI is encrypted both in transit and at rest using industry-standard encryption methods.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Incident Response</h3>
                <p className="text-gray-700">
                  We have established procedures for reporting and responding to any security incidents 
                  involving PHI.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">BAA Requirements</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Business Associate Agreement includes all required HIPAA provisions:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Permitted and required uses and disclosures of PHI</li>
              <li>• Prohibition on unauthorized use or disclosure of PHI</li>
              <li>• Safeguards to prevent unauthorized use or disclosure</li>
              <li>• Reporting of security incidents and breaches</li>
              <li>• Return or destruction of PHI upon termination</li>
              <li>• Compliance with HIPAA Security Rule requirements</li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Measures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Safeguards</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Multi-factor authentication</li>
                  <li>• Role-based access controls</li>
                  <li>• Audit logs and monitoring</li>
                  <li>• Automatic session timeouts</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Physical Safeguards</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Secure data centers</li>
                  <li>• Controlled facility access</li>
                  <li>• Workstation security</li>
                  <li>• Media controls</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Request a BAA</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              If your healthcare organization requires a Business Associate Agreement to use 
              DeepEvidence services, please contact our compliance team. We'll work with you 
              to execute a BAA that meets your specific requirements and ensures full HIPAA compliance.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Request BAA
                </Button>
                <Button variant="outline">
                  Download Sample BAA
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Contact:</strong> compliance@openevidence.com</p>
                <p><strong>Response Time:</strong> Within 2 business days</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BAA;
