import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, FileText, Send, Camera } from 'lucide-react';
import { mockCategories } from '../../data/mock';
import { toast } from 'sonner';
import apiService from '../../services/api';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [reportMode, setReportMode] = useState('selection');
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I\'m your Grievance Assistant. What problem are you facing today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const [conversationId, setConversationId] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendChatMessage = async (text) => {
    try {
      const history = messages
        .filter(msg => msg.sender !== 'system')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
          timestamp: msg.timestamp || new Date()
        }));

      return await apiService.sendChatMessage(text, conversationId, history);
    } catch (error) {
      console.error('Chat Error:', error);
      return null;
    }
  };

  const submitIssue = async (payload) => {
    try {
      return await apiService.createIssue(payload);
    } catch (error) {
      console.error('Submission Error:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const userMessage = { 
      id: Date.now(), 
      sender: 'user', 
      text: userText, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const result = await sendChatMessage(userText);
    setIsTyping(false);

    if (result && result.success) {
      if (result.conversationId && !conversationId) {
        setConversationId(result.conversationId);
      }

      if (result.extractedData) {
        setExtractedData(prev => ({
          ...prev,
          ...result.extractedData
        }));
      }

      setCanSubmit(result.canSubmit || false);

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: result.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } else {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "I'm having trouble connecting to the server. Please check your connection.",
        timestamp: new Date()
      }]);
    }
  };

  const handleChatSubmit = async () => {
    if (!canSubmit) {
      toast.error('Please provide more information before submitting');
      return;
    }

    const payload = {
      citizenName: 'Anonymous (AI Chat)',
      description: extractedData.description || messages.filter(m => m.sender === 'user').map(m => m.text).join('. '),
      category: extractedData.category || 'others',
      categoryName: mockCategories.find(c => c.id === extractedData.category)?.name || 'Others',
      severity: extractedData.severity || 'Medium',
      location: extractedData.location || 'Unknown',
      coordinates: location,
      photos: photos,
      source: 'ai_assistant'
    };

    const result = await submitIssue(payload);
    if (result && result.success) {
      toast.success('Report Submitted!');
      navigate(`/confirmation/${result.issue.id}`);
    } else {
      toast.error('Submission failed');
    }
  };

  if (reportMode === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="py-4 px-6 bg-white shadow-sm flex items-center gap-4">
          <button onClick={() => navigate('/citizen')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-blue-900">New Complaint</h1>
        </header>
        <div className="flex-1 container max-w-4xl mx-auto p-6 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">
            How do you want to report?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <button 
              onClick={() => setReportMode('ai')}
              className="card p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 text-left group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Bot className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Talk to AI Assistant</h3>
              <p className="text-gray-500">
                Interactive chat mode. Just describe the problem naturally, and our AI will file the report for you.
              </p>
            </button>

            <button 
              onClick={() => setReportMode('manual')}
              className="card p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-500 text-left group"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-gray-700 transition-colors">
                <FileText className="w-8 h-8 text-gray-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Fill Form Manually</h3>
              <p className="text-gray-500">
                Traditional form. Select categories, type details, and upload photos step-by-step yourself.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (reportMode === 'ai') {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        <header className="bg-blue-600 text-white p-4 shadow-md flex items-center justify-between">
           <div className="flex items-center gap-3">
             <button onClick={() => setReportMode('selection')} className="hover:bg-blue-700 p-1 rounded">
               <ArrowLeft className="w-6 h-6" />
             </button>
             <div className="flex items-center gap-2">
               <Bot className="w-6 h-6" />
               <div>
                  <h1 className="font-bold">Grievance Assistant</h1>
                  <p className="text-xs text-blue-200">AI Powered</p>
               </div>
             </div>
           </div>
           {canSubmit && (
             <button onClick={handleChatSubmit} className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold shadow hover:bg-blue-50">
               Submit Report
             </button>
           )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {messages.map(msg => (
             <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-1">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
             </div>
           ))}
           {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                 <span className="animate-pulse">...</span>
               </div>
             </div>
           )}
           <div ref={chatEndRef} />
        </div>

        {(extractedData.category || extractedData.location || extractedData.severity) && (
           <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex gap-2 overflow-x-auto text-xs">
              {extractedData.category && (
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-md whitespace-nowrap">
                   🏷️ {mockCategories.find(c => c.id === extractedData.category)?.name || extractedData.category}
                </span>
              )}
              {extractedData.severity && (
                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-md whitespace-nowrap">
                   🚨 {extractedData.severity}
                </span>
              )}
              {extractedData.location && extractedData.location !== 'Unknown Location' && (
                 <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md whitespace-nowrap">
                    📍 {extractedData.location}
                 </span>
              )}
              {!canSubmit && (
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-md whitespace-nowrap">
                   ⏳ Collecting info...
                </span>
              )}
           </div>
        )}

        <div className="p-4 bg-white border-t border-gray-200">
           <div className="flex items-center gap-2">
             <input
               type="text"
               value={inputMessage}
               onChange={(e) => setInputMessage(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               placeholder="Type your issue..."
               className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
             />
             <button 
               onClick={handleSendMessage}
               disabled={!inputMessage.trim()}
               className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <Send className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="py-4 px-6 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => setReportMode('selection')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Manual Report Form</h1>
      </header>
      <div className="container max-w-2xl mx-auto p-6">
        <p className="text-center text-gray-600">Manual form coming soon...</p>
      </div>
    </div>
  );
};

export default ReportIssuePage;