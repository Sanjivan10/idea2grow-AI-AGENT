
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, ChatState } from './types';
import { geminiService } from './services/geminiService';
import { Logo } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isStarted) {
      scrollToBottom();
    }
  }, [state.messages, isStarted, state.isLoading]);

  useEffect(() => {
    if (!isStarted) {
      inputRef.current?.focus();
    }
  }, [isStarted]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || state.isLoading) return;

    if (!isStarted) setIsStarted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: textToSend,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInput('');

    try {
      // Filter out 'system' messages from history as the API handles it via systemInstruction config
      const history = state.messages
        .filter(m => m.role !== Role.SYSTEM)
        .map(m => ({
          role: m.role as string,
          parts: [{ text: m.content }]
        }));

      const { text, sources } = await geminiService.generateResponse(textToSend, history);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: text,
        timestamp: new Date(),
        sources: sources,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMessage],
        isLoading: false,
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Strategic Engine Error: ${err.message || "Failed to process the request."}`,
      }));
    }
  };

  const handleReset = () => {
    setIsStarted(false);
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
    setInput('');
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let styledLine = line;
      // Bold handling
      styledLine = styledLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
      
      // List handling
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={i} className="ml-6 mb-2 list-disc text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: styledLine.trim().substring(2) }} />
        );
      }
      
      // Paragraphs
      if (!line.trim()) return <div key={i} className="h-4" />;
      return <p key={i} className="mb-4 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: styledLine }} />;
    });
  };

  const suggestions = [
    "Trending business growth ideas for 2026",
    "How to leverage AI for my small business?",
    "Show me new blog posts from idea2grow.com",
    "Digital marketing strategies for high conversion"
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-green-100 flex flex-col items-center font-['Inter']">
      {/* Background Visuals */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-[#8BD658]/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[800px] h-[800px] bg-[#3F6EC9]/5 rounded-full blur-[140px]"></div>
      </div>

      {!isStarted ? (
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-6 min-h-screen animate-slide-in">
          <div className="mb-14 flex flex-col items-center text-center">
            <div className="p-5 mb-10 bg-white/70 rounded-[2.5rem] border border-slate-100 shadow-xl backdrop-blur-xl">
              <Logo className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.95] md:leading-[1]">
              Strategic Ideas <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8BD658] via-[#3F6EC9] to-[#8BD658] bg-[length:200%_auto] animate-gradient-flow">
                to Grow Vision
              </span>
            </h1>
            <p className="text-slate-500 text-lg md:text-2xl max-w-2xl font-medium leading-relaxed">
              Synthesizing <span className="text-slate-900 font-bold underline decoration-[#8BD658]/30 decoration-4 underline-offset-4">idea2grow.com</span> for real-time insights and 2026 global trends.
            </p>
          </div>

          <div className="w-full max-w-3xl relative group mb-16">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#8BD658]/40 to-[#3F6EC9]/40 rounded-[3rem] blur-xl opacity-20 group-focus-within:opacity-60 transition duration-1000"></div>
            <div className="relative flex items-center bg-white border border-slate-200 shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[3rem] p-3 pr-6">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="What vision should we explore?"
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl md:text-3xl py-6 px-8 outline-none text-slate-800 placeholder:text-slate-300 font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || state.isLoading}
                className="p-5 rounded-full bg-slate-900 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="text-left p-6 rounded-3xl border border-slate-100 bg-white/50 backdrop-blur-sm hover:border-[#8BD658]/40 hover:bg-white hover:shadow-xl transition-all group"
              >
                <p className="text-slate-700 font-semibold mb-1 group-hover:text-slate-900 transition-colors">{s}</p>
                <div className="flex items-center text-xs font-bold text-[#3F6EC9] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore Insight</span>
                  <svg className="w-3 h-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-4xl h-screen bg-white shadow-2xl relative z-10 mx-auto">
          <header className="p-6 border-b border-slate-100 flex items-center justify-between backdrop-blur-md sticky top-0 bg-white/80 z-20">
            <div className="flex items-center space-x-4 cursor-pointer" onClick={handleReset}>
              <Logo className="w-10 h-10" />
              <div>
                <h2 className="font-black text-xl tracking-tight">Idea2Grow</h2>
                <p className="text-[10px] font-bold text-[#8BD658] uppercase tracking-[0.2em] leading-none">Strategic AI Agent</p>
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="p-3 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth scrollbar-hide">
            {state.messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex flex-col ${message.role === Role.USER ? 'items-end' : 'items-start'} group`}
              >
                <div className={`max-w-[85%] md:max-w-[75%] rounded-[2rem] px-8 py-6 ${
                  message.role === Role.USER 
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' 
                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                }`}>
                  <div className="text-sm md:text-base">
                    {renderMessageContent(message.content)}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verified Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:border-[#3F6EC9] hover:text-[#3F6EC9] transition-all flex items-center shadow-sm"
                          >
                            <svg className="w-2.5 h-2.5 mr-1.5 text-[#3F6EC9]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-2 px-4 uppercase tracking-widest">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {state.isLoading && (
              <div className="flex items-center space-x-3 px-8 py-6 bg-slate-50 rounded-[2rem] rounded-tl-none w-fit border border-slate-100 animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-[#8BD658] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#3F6EC9] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#8BD658] rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Synthesizing Growth...</span>
              </div>
            )}
            {state.error && (
              <div className="w-full p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 flex items-center space-x-4">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-semibold">{state.error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-slate-100 bg-white/50 backdrop-blur-md">
            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8BD658]/30 to-[#3F6EC9]/30 rounded-[2rem] blur-lg opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-[2rem] p-2 pr-4 shadow-sm group-focus-within:border-[#3F6EC9]/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for strategic advice..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-base py-4 px-6 outline-none text-slate-800 placeholder:text-slate-300 font-medium"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || state.isLoading}
                  className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] mt-4">
              AI-Augmented Strategic Intelligence • 2026 Forecast Engine
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
