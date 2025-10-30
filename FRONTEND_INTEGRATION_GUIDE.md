# OpenEvidence Clone - Frontend Integration Guide

This React + TypeScript frontend is designed to replicate the OpenEvidence website interface and integrate with a Python LLM backend service.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Architecture Overview

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Lucide React** for icons

### Key Features Implemented
- ✅ Homepage with search interface
- ✅ Question & Answer results page with streaming responses
- ✅ Material-UI inspired design matching original
- ✅ Responsive layout
- ✅ Loading states with step indicators
- ✅ Reference citations display
- ✅ Follow-up questions
- ✅ About and Security pages
- ✅ API interface ready for Python backend

## 🔌 Python Backend Integration

### API Interface Location
The frontend API interface is defined in `src/lib/medical-api.ts`. This file contains:

- TypeScript interfaces for all data structures
- Complete API client implementation
- Detailed Python backend implementation guide
- Mock streaming responses for development

### Required Python API Endpoints

#### 1. POST `/api/ask` - Ask Medical Question
**Request:**
```json
{
  "question": "What is the gold standard treatment for...",
  "context": "optional context",
  "userId": "optional user ID",
  "sessionId": "optional session ID"
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"content": "Based on current medical evidence", "isComplete": false}
data: {"content": " the treatment approach involves", "isComplete": false}
data: {"content": "", "isComplete": true, "references": [...], "followUpQuestions": [...]}
```

#### 2. GET `/api/history/:userId` - Get Search History
**Response:**
```json
[
  {
    "id": "uuid",
    "question": "Question text",
    "timestamp": "2024-01-01T00:00:00Z",
    "summary": "Brief answer summary"
  }
]
```

#### 3. POST `/api/preferences` - Save User Preferences
**Request:**
```json
{
  "userId": "user-id",
  "preferredSources": ["pubmed", "cochrane"],
  "language": "en",
  "responseFormat": "detailed",
  "includeReferences": true
}
```

#### 4. GET `/api/preferences/:userId` - Get User Preferences

### Python Implementation Example

```python
from flask import Flask, request, Response, jsonify
import json
import time

app = Flask(__name__)

@app.route('/api/ask', methods=['POST'])
def ask_medical_question():
    data = request.json
    question = data.get('question')
    
    def generate_response():
        # Your LLM processing logic here
        response_chunks = process_medical_question(question)
        
        for chunk in response_chunks:
            yield f"data: {json.dumps(chunk)}\n\n"
    
    return Response(
        generate_response(), 
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    )

def process_medical_question(question):
    """
    Your LLM processing logic goes here.
    This should yield StreamingResponse objects.
    """
    # Example implementation:
    # 1. Analyze the question
    # 2. Search medical databases
    # 3. Generate response using your LLM
    # 4. Yield chunks as they're generated
    # 5. Include references and follow-up questions in final chunk
    pass
```

### CORS Configuration
Make sure your Python backend allows CORS for the frontend:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])  # Vite dev server
```

## 🎨 Design System

The frontend closely replicates the original OpenEvidence design:

### Colors
- Primary: Blue (#2563eb)
- Secondary: Orange (#f97316) 
- Text: Gray scale (#111827, #374151, #6b7280)
- Background: White (#ffffff)

### Typography
- Font: System fonts (similar to Material-UI)
- Headings: Bold, various sizes
- Body: Regular weight, good line height

### Components
- Cards with subtle shadows
- Rounded corners (8px)
- Hover states and transitions
- Loading animations
- Responsive grid layouts

## 📱 Responsive Design

The interface is fully responsive:
- **Desktop**: Full layout with sidebar navigation
- **Tablet**: Adapted layout with collapsible elements  
- **Mobile**: Stacked layout with hamburger menu

## 🔄 Streaming Response Implementation

The frontend supports real-time streaming responses:

1. **Loading States**: Step-by-step progress indicators
2. **Streaming Text**: Character-by-character response display
3. **References**: Displayed after response completion
4. **Follow-up Questions**: Generated based on the query

### Frontend Streaming Code
```typescript
// Example usage in React component
const startStreamingResponse = async () => {
  for await (const chunk of mockStreamingResponse(question)) {
    if (chunk.isComplete) {
      setIsLoading(false);
      setReferences(chunk.references || []);
      setFollowUpQuestions(chunk.followUpQuestions || []);
    } else {
      setStreamingContent(prev => prev + chunk.content);
    }
  }
};
```

## 🚦 Development vs Production

### Development Mode
- Uses mock streaming responses
- No backend required
- All features functional for demo

### Production Mode
1. Update `baseUrl` in `medical-api.ts`
2. Replace mock functions with real API calls
3. Configure CORS on your Python backend
4. Deploy both frontend and backend

## 📁 Project Structure

```
src/
├── components/ui/          # shadcn/ui components
├── pages/                  # Page components
│   ├── Home.tsx           # Homepage with search
│   ├── AskResults.tsx     # Q&A results page
│   ├── About.tsx          # About page
│   └── Security.tsx       # Security page
├── lib/
│   ├── medical-api.ts     # API interface & Python integration guide
│   └── utils.ts           # Utility functions
└── App.tsx                # Main app with routing
```

## 🔧 Customization

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation links

### Modifying API Interface
1. Update interfaces in `medical-api.ts`
2. Modify API client methods
3. Update Python backend accordingly

### Styling Changes
1. Update Tailwind classes
2. Modify `index.css` for global styles
3. Use shadcn/ui theme customization

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Integration Checklist
- [ ] Python backend running on specified port
- [ ] CORS configured correctly
- [ ] All API endpoints implemented
- [ ] Streaming responses working
- [ ] Error handling implemented
- [ ] Authentication (if required)

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## 🤝 Contributing

1. Follow the existing code style
2. Update TypeScript interfaces when changing API
3. Test streaming responses thoroughly
4. Ensure responsive design works on all devices
5. Update this README when adding new features

---

**Note**: This frontend is designed to work seamlessly with your Python LLM backend. The `medical-api.ts` file contains everything you need to integrate the two systems.