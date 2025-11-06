import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CitationMark from '@/components/CitationMark';
import { 
  Search, 
  Mic, 
  Menu, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  ChevronRight,
  Star,
  Calendar,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { medicalAPI, type Reference, type StreamingResponse, type CitationSegment } from '@/lib/medical-api';

interface FollowUpQuestion {
  id: number;
  text: string;
}

const AskResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // 流式响应状态
  const [answerSegments, setAnswerSegments] = useState<CitationSegment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentSegmentText, setCurrentSegmentText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // 引用和后续问题
  const [references, setReferences] = useState<Reference[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  
  const initialQuestion = searchParams.get('q') || '';

  // 获取完整答案内容
  const getFullAnswerContent = () => {
  const fullContent = answerSegments.map(segment => segment.text).join('');
  return fullContent.trim();
  };

  // 判断是否应该显示默认消息
  const shouldShowDefaultMessage = () => {
  return !isStreaming && answerSegments.length === 0;
  };
 
  useEffect(() => {
    setQuestion(initialQuestion);
    if (initialQuestion.trim()) {
      startLoadingProcess();
    }
  }, [initialQuestion]);

  const startLoadingProcess = () => {
    setIsLoading(true);
    setError(null);
    setAnswerSegments([]);
    setCurrentSegmentIndex(0);
    setCurrentSegmentText('');
    setIsStreaming(false);
    
    const steps = [
      'Analyzing query',
      'Searching published medical literature, guidelines, FDA, CDC, and more',
      'Synthesizing relevant information'
    ];
    
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      } else {
        clearInterval(stepInterval);
        // 开始流式响应
        setTimeout(() => {
          startStreamingResponse();
        }, 1000);
      }
    }, 2000);
  };

  const startStreamingResponse = async () => {
    try {
      setIsStreaming(true);
      setIsLoading(false); // 开始流式响应时结束加载状态
      
      const query = {
        question: initialQuestion,
        userId: 'user123',
        sessionId: Date.now().toString()
      };

      // 尝试连接真实API
      try {
        const stream = await medicalAPI.askQuestion(query);
        const reader = stream.getReader();
        
        let currentSegmentIndex = 0;
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          console.log('Received streaming data:', value); // 调试日志

          if (value.isComplete) {
            // 完成响应
            setIsStreaming(false);
            if (value.references && value.references.length > 0) {
              setReferences(value.references);
            }
            if (value.followUpQuestions && value.followUpQuestions.length > 0) {
              setFollowUpQuestions(
                value.followUpQuestions.map((q, index) => ({ id: index + 1, text: q }))
              );
            }
            break;
          } else if (value.content) {
            // 处理内容
            accumulatedContent += value.content;
            
            // 检查是否有引用标记
            if (value.citationMark && value.citationMark.citations.length > 0) {
              // 有引用的内容，创建新段落
              setAnswerSegments(prev => {
                const newSegments = [...prev];
                newSegments[currentSegmentIndex] = {
                  text: accumulatedContent,
                  citations: value.citationMark.citations
                };
                return newSegments;
              });
              
              // 准备下一个段落
              currentSegmentIndex++;
              accumulatedContent = '';
            } else {
              // 普通内容，更新当前段落
              setAnswerSegments(prev => {
                const newSegments = [...prev];
                newSegments[currentSegmentIndex] = {
                  text: accumulatedContent,
                  citations: newSegments[currentSegmentIndex]?.citations || []
                };
                return newSegments;
              });
            }
            
            // 更新当前显示的文本
            setCurrentSegmentText(accumulatedContent);
          }
          
          // 处理引用信息
          if (value.references && value.references.length > 0) {
            setReferences(value.references);
          }
        }
        
        // 确保最后的内容被保存
        if (accumulatedContent.trim()) {
          setAnswerSegments(prev => {
            const newSegments = [...prev];
            newSegments[currentSegmentIndex] = {
              text: accumulatedContent,
              citations: newSegments[currentSegmentIndex]?.citations || []
            };
            return newSegments;
          });
        }
        
      } catch (apiError) {
        console.warn('API连接失败，使用模拟数据:', apiError);
        // 使用模拟流式响应
        await simulateStreamingResponse();
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      setError('Failed to get response. Please try again.');
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 模拟流式响应（当后端不可用时）
  const simulateStreamingResponse = async () => {
    setIsStreaming(true);
    setIsLoading(false);
    
    const mockSegments = [
      {
        text: "基于当前医学证据，对于25岁健康女性种植牙手术后，",
        citations: []
      },
      {
        text: "预防性抗生素的使用存在争议。",
        citations: [1, 2]
      },
      {
        text: " 多项系统评价显示，对于系统性健康的患者进行常规种植体植入手术，",
        citations: [1]
      },
      {
        text: "预防性抗生素可能不是必需的。",
        citations: [2, 3]
      },
      {
        text: " 然而，一些临床指南仍建议在特定情况下使用预防性抗生素，",
        citations: [3, 4]
      },
      {
        text: "特别是对于有感染风险因素的患者。",
        citations: [4]
      }
    ];

    const mockReferences = [
      {
        id: 1,
        title: "Antibiotics or No Antibiotics, That Is the Question: An Update on Efficient and Effective Use of Antibiotics in Dental Practice",
        url: "https://pubmed.ncbi.nlm.nih.gov/34065113/",
        journal: "Antibiotics (Basel)",
        authors: "Buonavoglia A, Leone P, Solimando AG, et al.",
        publishedDate: "2021-05-09",
        isNew: false,
        type: "review" as const
      },
      {
        id: 2,
        title: "The role of antibiotics in preventing surgical complications in periodontology and implant dentistry",
        url: "https://pubmed.ncbi.nlm.nih.gov/40665923/",
        journal: "Periodontol 2000",
        authors: "Chen Z, Chiou LL, Calatrava J, Wang HL",
        publishedDate: "2025-07-16",
        isLeading: true,
        isNew: true,
        type: "meta-analysis" as const
      },
      {
        id: 3,
        title: "Antibiotic prophylaxis for dental implant placement: A systematic review",
        url: "https://pubmed.ncbi.nlm.nih.gov/31954466/",
        journal: "Clinical Oral Implants Research",
        authors: "Schweitzer C, Brezin A, Cochener B, et al.",
        publishedDate: "2020-01-18",
        isLeading: true,
        type: "research" as const
      },
      {
        id: 4,
        title: "Clinical guidelines for antibiotic prophylaxis in dental implant surgery",
        url: "https://pubmed.ncbi.nlm.nih.gov/35570159/",
        journal: "Journal of Clinical Periodontology",
        authors: "Lin CC, Rose-Nussbaumer JR, Al-Mohtaseb ZN, et al.",
        publishedDate: "2022-08-01",
        isNew: true,
        type: "guideline" as const
      }
    ];

    // 模拟逐段输出
    for (let i = 0; i < mockSegments.length; i++) {
      const segment = mockSegments[i];
      
      // 逐字输出效果
      const words = segment.text.split('');
      let currentText = '';
      
      for (const char of words) {
        currentText += char;
        
        setAnswerSegments(prev => {
          const newSegments = [...prev];
          newSegments[i] = {
            text: currentText,
            citations: segment.citations
          };
          return newSegments;
        });
        
        await new Promise(resolve => setTimeout(resolve, 50)); // 打字效果
      }
      
      await new Promise(resolve => setTimeout(resolve, 300)); // 段落间停顿
    }

    // 设置引用和后续问题
    setReferences(mockReferences);
    setFollowUpQuestions([
      { id: 1, text: "种植牙手术后的护理要点有哪些？" },
      { id: 2, text: "种植牙的成功率和影响因素是什么？" },
      { id: 3, text: "种植牙术后可能出现哪些并发症？" }
    ]);
    
    setIsStreaming(false);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      navigate(`/ask?q=${encodeURIComponent(question.trim())}`);
      window.location.reload();
    }
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpQuestion.trim()) {
      navigate(`/ask?q=${encodeURIComponent(followUpQuestion.trim())}`);
      window.location.reload();
    }
  };

  const copyToClipboard = () => {
    const fullText = answerSegments.map(segment => segment.text).join('');
    navigator.clipboard.writeText(fullText).then(() => {
      // 可以添加一个toast通知
      console.log('Text copied to clipboard');
    });
  };

  const steps = [
    'Analyzing query',
    'Searching published medical literature, guidelines, FDA, CDC, and more',
    'Synthesizing relevant information'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <Card className="p-4 shadow-sm border border-gray-200">
            <div className="relative">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="min-h-[60px] border-0 resize-none focus:ring-0 focus:outline-none"
                maxLength={2500}
              />
              <div className="flex items-center justify-between mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={!question.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-8 border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Loading Steps */}
        {isLoading && (
          <Card className="p-6 mb-8">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {index < currentStep ? (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    ) : index === currentStep ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Results with Citations */}
        {(!isLoading || answerSegments.length > 0) && (
          <>
            {/* Answer with Citation Marks */}
            <Card className="p-6 mb-8">
              <div className="prose max-w-none">
                <div className="text-lg leading-relaxed text-gray-900">
                  {shouldShowDefaultMessage() ? (
                    // 显示默认消息
                    <div className="text-center py-8">
                      <div className="text-gray-600 text-lg">您的问题超出医学范围，无法回答</div>
                    </div>
                  ) : isStreaming && answerSegments.length === 0 ? (
                    // 正在加载
                    <div className="text-gray-500">正在生成回答...</div>
                  ) : answerSegments.length > 0 ? (
                    // 有内容时，逐段渲染以保持 citations
                    <div className="markdown-content">
                      {answerSegments.map((segment, index) => (
                        <span key={index} className="inline">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            className="inline-markdown"
                            components={{
                              // 内联渲染组件
                              p: ({ children }) => <span className="inline">{children}</span>,
                              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 block">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 block">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-lg font-medium mb-2 block">{children}</h3>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 block">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 block">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                              pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-4 block">{children}</pre>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 block">{children}</blockquote>,
                            }}
                          >
                            {segment.text}
                          </ReactMarkdown>
                          {segment.citations.length > 0 && (
                            <CitationMark citations={segment.citations} />
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    // 备用显示
                    <div className="text-gray-500">暂无内容</div>
                  )}
                  {isStreaming && <span className="streaming-cursor">|</span>}
                </div>
              </div>

                {!isLoading && answerSegments.length > 0 && (
                <div className="flex items-center space-x-4 mt-6 pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Helpful
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Not Helpful
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              )}
            </Card>

            {/* References */}
            {references.length > 0 && (
              <Card className="p-6 mb-8" id="references-section">
                <Accordion type="single" collapsible defaultValue="references">
                  <AccordionItem value="references">
                    <AccordionTrigger className="text-lg font-semibold">
                      References
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {references.map((ref) => (
                          <div 
                            key={ref.id} 
                            id={`reference-${ref.id}`}
                            className="reference-item border-l-4 border-gray-200 pl-4 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="reference-number">
                                    {ref.id}
                                  </span>
                                  {ref.isLeading && (
                                    <Badge variant="outline" className="text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      Leading Journal
                                    </Badge>
                                  )}
                                  {ref.isNew && (
                                    <Badge variant="outline" className="text-xs">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      New Research
                                    </Badge>
                                  )}
                                  {ref.type && (
                                    <Badge variant="outline" className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {ref.type}
                                    </Badge>
                                  )}
                                </div>
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-medium block mb-1"
                                >
                                  {ref.title}
                                </a>
                                {ref.authors && (
                                  <p className="text-sm text-gray-600 mb-1">{ref.authors}</p>
                                )}
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  {ref.journal && <span>{ref.journal}</span>}
                                  {ref.publishedDate && <span>{ref.publishedDate}</span>}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            )}

            {/* Follow-up Questions */}
            {followUpQuestions.length > 0 && (
              <Card className="p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Follow-Up Questions</h3>
                <div className="space-y-3">
                  {followUpQuestions.map((fq) => (
                    <div
                      key={fq.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => setFollowUpQuestion(fq.text)}
                    >
                      <span className="text-sm text-gray-700">{fq.text}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Follow-up Question Input */}
            <form onSubmit={handleFollowUpSubmit}>
              <Card className="p-4 shadow-sm border border-gray-200">
                <div className="relative">
                  <Textarea
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="min-h-[60px] border-0 resize-none focus:ring-0 focus:outline-none"
                    maxLength={2500}
                  />
                  <div className="flex items-center justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={!followUpQuestion.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AskResults;
