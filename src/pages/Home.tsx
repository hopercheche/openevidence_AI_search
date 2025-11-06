import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Search, Mic, Menu, ArrowRight, Star, Users, BookOpen, Shield } from 'lucide-react';

const Home = () => {
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      navigate(`/ask?q=${encodeURIComponent(question.trim())}`);
    }
  };

  const exampleQuestions = [
    "Is femtosecond laser-assisted cataract surgery the gold standard for cataract surgery?",
    "What are the latest guidelines for hypertension management?",
    "What is the efficacy of mRNA vaccines against COVID-19 variants?",
    "What are the contraindications for prescribing metformin?"
  ];

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: "Evidence-Based Answers",
      description: "Get answers backed by peer-reviewed research and clinical guidelines"
    },
    {
      icon: <Star className="h-6 w-6 text-blue-600" />,
      title: "Real-Time Citations",
      description: "Every statement is linked to its source with interactive citation marks"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Trusted by Professionals",
      description: "Used by healthcare professionals worldwide for clinical decision support"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Reliable Sources",
      description: "Information from PubMed, Cochrane, FDA, CDC, and leading medical journals"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-2xl">O</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">DeepEvidence</h1>
            </div>
            <p className="text-xl text-gray-600 mb-2">
              Get evidence-based answers to your medical questions
            </p>
            <p className="text-gray-500">
              Powered by the latest research from PubMed, Cochrane, FDA, CDC, and more
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-12">
            <Card className="p-6 shadow-lg border border-gray-200">
              <div className="relative">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a medical question..."
                  className="min-h-[120px] text-lg border-0 resize-none focus:ring-0 focus:outline-none"
                  maxLength={2500}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Voice
                    </Button>
                    <span className="text-sm text-gray-400">
                      {question.length}/2500
                    </span>
                  </div>
                  <Button
                    type="submit"
                    disabled={!question.trim()}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Ask Question
                  </Button>
                </div>
              </div>
            </Card>
          </form>

          {/* Example Questions */}
          <div className="mb-16">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Try these example questions:
            </h2>
            <div className="grid gap-3">
              {exampleQuestions.map((q, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
                  onClick={() => setQuestion(q)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm">{q}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">O</span>
                </div>
                <span className="font-semibold text-gray-900">DeepEvidence</span>
              </div>
              <p className="text-sm text-gray-600">
                Evidence-based medical information for healthcare professionals and researchers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/about" className="hover:text-blue-600">About</Link></li>
                <li><Link to="/security" className="hover:text-blue-600">Security</Link></li>
                <li><Link to="/announcements" className="hover:text-blue-600">Announcements</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/baa" className="hover:text-blue-600">BAA</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
                <li><Link to="/help" className="hover:text-blue-600">Help Center</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 DeepEvidence. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
