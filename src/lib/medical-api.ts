// API interface for Python backend integration
// This file provides the structure for integrating with a Python LLM API service

export interface MedicalQuery {
  question: string;
  context?: string;
  userId?: string;
  sessionId?: string;
}

export interface Reference {
  id: number;
  title: string;
  url: string;
  journal?: string;
  authors?: string;
  publishedDate?: string;
  isLeading?: boolean;
  isNew?: boolean;
  type?: 'research' | 'guideline' | 'review' | 'meta-analysis';
  relevanceScore?: number;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  references?: Reference[];
  followUpQuestions?: string[];
  confidence?: number;
  segmentIndex?: number;
  wordIndex?: number;
  totalWords?: number;
  citationMark?: {
    citations: number[];
    segmentIndex: number;
  };
  totalSegments?: number;
  timestamp?: string;
}

export interface CitationSegment {
  text: string;
  citations: number[];
}

export interface SearchHistory {
  id: string;
  question: string;
  timestamp: Date;
  summary: string;
}

export interface UserPreferences {
  userId: string;
  preferredSources: string[];
  language: string;
  responseFormat: 'detailed' | 'concise' | 'bullet-points';
  includeReferences: boolean;
}

/**
 * 转换 Baichuan 后端响应格式为前端期望格式
 */
function transformBaichuanResponse(data: any): StreamingResponse | null {
  try {
    // 处理思考进度
    if (data.type === 'thinking_progress') {
      return {
        content: `🧠 ${data.step}`,
        isComplete: false,
        timestamp: data.timestamp
      };
    }

    // 处理思考完成
    if (data.type === 'thinking_complete') {
      return {
        content: '✅ 思考完成，开始生成回答...',
        isComplete: false,
        timestamp: data.timestamp
      };
    }

    // 处理引用加载
    if (data.type === 'references_loaded') {
      return {
        content: `📚 已加载 ${data.count || data.references?.length || 0} 条相关文献`,
        isComplete: false,
        references: data.references,
        timestamp: data.timestamp
      };
    }

    // 处理内容开始
    if (data.type === 'content_start') {
      return {
        content: '',
        isComplete: false,
        timestamp: data.timestamp
      };
    }

    // 处理带引用的内容
    if (data.type === 'cited_content' && data.content) {
      return {
        content: data.content,
        isComplete: false,
        citationMark: data.citations ? {
          citations: data.citations,
          segmentIndex: 0
        } : undefined,
        timestamp: data.timestamp
      };
    }

    // 处理普通内容
    if (data.content && !data.isComplete) {
      return {
        content: data.content,
        isComplete: false,
        citationMark: data.citations ? {
          citations: data.citations,
          segmentIndex: 0
        } : undefined,
        timestamp: data.timestamp
      };
    }

    // 处理完成响应
    if (data.isComplete) {
      return {
        content: '',
        isComplete: true,
        references: data.references || [],
        followUpQuestions: data.followUpQuestions || [],
        timestamp: data.timestamp
      };
    }

    // 处理错误
    if (data.error) {
      throw new Error(data.error);
    }

    return null;
  } catch (error) {
    console.error('Error transforming Baichuan response:', error);
    return null;
  }
}

class MedicalAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // 根据环境自动选择API地址
    this.baseUrl = baseUrl || 
      (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:8000' 
        : 'https://your-backend-domain.com');
  }

  /**
   * Ask a medical question with streaming response
   */
  async askQuestion(query: MedicalQuery): Promise<ReadableStream<StreamingResponse>> {
    const response = await fetch(`${this.baseUrl}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    return new ReadableStream({
      start: (controller) => {
        let buffer = '';
        
        const pump = (): Promise<void> => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }

            // 将新数据添加到缓冲区
            buffer += new TextDecoder().decode(value);
            
            // 按行分割处理
            const lines = buffer.split('\n');
            
            // 保留最后一行（可能不完整）
            buffer = lines.pop() || '';
            
            // 处理完整的行
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr);
                    
                    // 转换 Baichuan 后端数据格式为前端期望格式
                    const transformedData = transformBaichuanResponse(data);
                    if (transformedData) {
                      controller.enqueue(transformedData);
                    }
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e, 'Line:', line);
                }
              }
            }

            return pump();
          });
        };

        return pump();
      },
    });
  }

  /**
   * Get user's search history
   */
  async getSearchHistory(userId: string): Promise<SearchHistory[]> {
    const response = await fetch(`${this.baseUrl}/api/search/history?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.history || [];
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: UserPreferences): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/api/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    const response = await fetch(`${this.baseUrl}/api/preferences?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

// Export singleton instance
export const medicalAPI = new MedicalAPI();

// Mock data for development (remove when connecting to real backend)
export const mockStreamingResponse = async function* (question: string): AsyncGenerator<StreamingResponse> {
  const responses = [
    { content: "Based on current medical evidence", isComplete: false },
    { content: ", femtosecond laser-assisted cataract surgery", isComplete: false },
    { content: " is not considered the gold standard", isComplete: false },
    { content: " for cataract surgery. Standard phacoemulsification", isComplete: false },
    { content: " remains the preferred technique", isComplete: false },
    { content: " based on current evidence and guidelines.", isComplete: false },
    {
      content: "",
      isComplete: true,
      references: [
        {
          id: 1,
          title: "Laser-Assisted Cataract Surgery Versus Standard Ultrasound Phacoemulsification",
          url: "https://pubmed.ncbi.nlm.nih.gov/37369549",
          journal: "Cochrane Database",
          type: "meta-analysis" as const
        },
        {
          id: 2,
          title: "Femtosecond Laser-Assisted Cataract Surgery: A Report by the American Academy of Ophthalmology",
          url: "https://pubmed.ncbi.nlm.nih.gov/35570159",
          type: "guideline" as const,
          isLeading: true
        }
      ],
      followUpQuestions: [
        "Which patient populations benefit most from femtosecond laser-assisted cataract surgery?",
        "What are the main contraindications for femtosecond laser use in cataract procedures?",
        "Are there unique postoperative complications associated with femtosecond laser-assisted cataract surgery?"
      ]
    }
  ];

  for (const response of responses) {
    yield response;
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  }
};

export default MedicalAPI;