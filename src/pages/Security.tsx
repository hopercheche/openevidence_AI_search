import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Menu, Shield, Lock, Eye, Server, Users, FileCheck } from 'lucide-react';

const Security = () => {
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Security & Privacy</h1>
          <p className="text-xl text-gray-600">
            Your data security and privacy are our top priorities
          </p>
        </div>

        <div className="space-y-8">
          {/* Compliance Badges */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compliance & Certifications</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                HIPAA Compliant
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                SOC 2 Type II
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                GDPR Compliant
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                ISO 27001
              </Badge>
            </div>
          </Card>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Data Encryption</h3>
              </div>
              <p className="text-gray-700">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. 
                Your sensitive information is protected with industry-standard cryptographic protocols.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Privacy by Design</h3>
              </div>
              <p className="text-gray-700">
                We collect only the minimum data necessary to provide our services. Personal health 
                information is never stored or used for training our AI models.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Server className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Secure Infrastructure</h3>
              </div>
              <p className="text-gray-700">
                Our infrastructure is hosted on enterprise-grade cloud platforms with 24/7 monitoring, 
                automated security updates, and regular penetration testing.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Access Controls</h3>
              </div>
              <p className="text-gray-700">
                Multi-factor authentication, role-based access controls, and regular access reviews 
                ensure that only authorized personnel can access sensitive systems.
              </p>
            </Card>
          </div>

          {/* Data Handling */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Handling Practices</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">What We Collect</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Medical questions and search queries (anonymized)</li>
                  <li>• Usage analytics to improve our service</li>
                  <li>• Account information for registered users</li>
                  <li>• Technical logs for security and performance monitoring</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">What We Don't Collect</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Patient names or identifiable health information</li>
                  <li>• Medical records or clinical data</li>
                  <li>• Biometric or genetic information</li>
                  <li>• Location data beyond general geographic region</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Retention</h3>
                <p className="text-gray-700">
                  We retain data only as long as necessary to provide our services. Search queries 
                  are anonymized and aggregated for service improvement. Personal account data is 
                  deleted upon request or account closure.
                </p>
              </div>
            </div>
          </Card>

          {/* Business Associate Agreement */}
          <Card className="p-8 bg-blue-50 border-blue-200">
            <div className="flex items-center mb-4">
              <FileCheck className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Business Associate Agreement</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              For healthcare organizations requiring HIPAA compliance, we offer a comprehensive 
              Business Associate Agreement (BAA) that outlines our commitment to protecting 
              protected health information (PHI) and maintaining compliance with healthcare regulations.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Request BAA
            </Button>
          </Card>

          {/* Security Contact */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have security concerns or wish to report a vulnerability, please contact 
              our security team immediately. We take all security reports seriously and will 
              respond promptly to investigate and address any issues.
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> security@openevidence.com</p>
              <p><strong>Response Time:</strong> Within 24 hours for critical issues</p>
              <p><strong>PGP Key:</strong> Available upon request</p>
            </div>
          </Card>

          {/* Regular Updates */}
          <Card className="p-8 bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Continuous Improvement</h2>
            <p className="text-gray-700 leading-relaxed">
              We continuously monitor and improve our security practices. Our security policies 
              are reviewed quarterly, and we conduct regular security assessments, employee 
              training, and third-party audits to ensure we maintain the highest standards 
              of data protection and privacy.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Security;