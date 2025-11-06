import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Search, Menu } from 'lucide-react';

const TestSearch = () => {
  const navigate = useNavigate();

  const handleTestSearch = () => {
    navigate('/ask?q=What%20is%20the%20gold%20standard%20treatment%20for%20hypertension%3F');
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Search Functionality</h1>
          <p className="text-xl text-gray-600">
            Test the streaming response feature
          </p>
        </div>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Test</h2>
          <p className="text-gray-700 mb-6">
            Click the button below to test the search functionality with a sample medical question.
          </p>
          <Button 
            onClick={handleTestSearch}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Test: "What is the gold standard treatment for hypertension?"
          </Button>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manual Test</h2>
          <p className="text-gray-700 mb-4">
            Or enter your own question:
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const question = formData.get('question') as string;
            if (question.trim()) {
              navigate(`/ask?q=${encodeURIComponent(question.trim())}`);
            }
          }}>
            <div className="space-y-4">
              <Textarea
                name="question"
                placeholder="Enter your medical question..."
                className="min-h-[100px]"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TestSearch;
