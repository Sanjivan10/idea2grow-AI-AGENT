
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
      styledLine = styledLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
      
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={i} className="ml-6 mb-2 list-disc text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: styledLine.trim().substring(2) }} />
        );
      }
      
      if (!line.trim()) return <div key={i} className="h-4" />;
      return <p key={i} className="mb-4 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: styledLine }} />;
    });
  };

  const suggestions = [
    "Latest business growth ideas for 2026",
    "How can I grow my WordPress site?",
    "Summarize idea2grow.com services",
    "Global digital marketing trends"
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-green-100 flex flex-col font-['Inter']">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#8BD658]/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[#3F6EC9]/10 rounded-full blur-[160px]"></div>
      </div>

      {!isStarted ? (
        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-6 animate-slide-in">
          <div className="mb-14 flex flex-col items-center text-center">
            <div className="p-6 mb-10 bg-white/80 rounded-3xl border border-white shadow-2xl backdrop-blur-xl">
              <Logo className="w-24 h-24 sm:w-32 sm:h-32" />
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-900 mb-8 leading-none">
              Idea<span className="text-[#8BD658]">2</span>Grow <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3F6EC9] to-[#8BD658] bg-[length:200%_auto] animate-gradient-flow">
                Strategic Intelligence
              </span>
            </h1>
            <p className="text-slate-500 text-xl md:text-3xl max-w-3xl font-medium leading-relaxed">
              Your humble advisor for <span className="text-slate-900 font-bold border-b-4 border-[#8BD658]/30">visionary growth</span> and real-time business insights.
            </p>
          </div>

          <div className="w-full max-w-4xl relative group mb-16">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8BD658] to-[#3F6EC9] rounded-[2.5rem] blur-2xl opacity-20 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white border border-slate-100 shadow-[0_32px_80px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-3 pr-6">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="What is your vision for 2026?"
                className="flex-1 bg-transparent border-none focus:ring-0 text-2xl md:text-4xl py-6 px-8 outline-none text-slate-800 placeholder:text-slate-200 font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || state.isLoading}
                className="p-6 rounded-full bg-[#3F6EC9] text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="text-left p-8 rounded-[2rem] border border-white bg-white/40 backdrop-blur-md hover:border-[#8BD658]/50 hover:bg-white hover:shadow-2xl transition-all group"
              >
                <p className="text-slate-600 font-bold text-lg mb-2 group-hover:text-slate-900 transition-colors">{s}</p>
                <div className="flex items-center text-xs font-black text-[#3F6EC9] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Analyze Vision</span>
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-screen bg-white/50 backdrop-blur-3xl relative z-10 border-x border-slate-100 shadow-2xl overflow-hidden">
          <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center space-x-5 cursor-pointer group" onClick={handleReset}>
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-[#8BD658]/10 transition-colors">
                <Logo className="w-10 h-10" />
              </div>
              <div>
                <h2 className="font-black text-2xl tracking-tighter text-slate-900">Idea2Grow</h2>
                <p className="text-[10px] font-black text-[#8BD658] uppercase tracking-[0.3em] leading-none mt-1">Strategic AI Ecosystem</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleReset}
                className="flex items-center space-x-2 px-5 py-2.5 text-slate-500 hover:text-red-500 transition-all rounded-full hover:bg-red-50 font-bold text-xs uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>New Strategy</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 scroll-smooth scrollbar-hide flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-12">
              {state.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex flex-col ${message.role === Role.USER ? 'items-end' : 'items-start'} animate-slide-in`}
                >
                  <div className={`max-w-[90%] md:max-w-[80%] rounded-[2.5rem] px-10 py-8 ${
                    message.role === Role.USER 
                      ? 'bg-gradient-to-br from-[#3F6EC9] to-[#2d52a1] text-white rounded-tr-none shadow-[0_20px_40px_rgba(63,110,201,0.2)]' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
                  }`}>
                    <div className={`text-base md:text-lg leading-relaxed ${message.role === Role.USER ? 'font-medium' : 'font-normal'}`}>
                      {renderMessageContent(message.content)}
                    </div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-1.5 h-1.5 bg-[#3F6EC9] rounded-full"></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Intelligence Sources</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {message.sources.map((source, idx) => (
                            <a 
                              key={idx} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#3F6EC9] hover:bg-white hover:text-[#3F6EC9] transition-all flex items-center group/link shadow-sm"
                            >
                              <span className="w-2 h-2 rounded-full bg-[#8BD658] mr-2 group-hover/link:animate-ping"></span>
                              {source.title}
                              <svg className="w-3 h-3 ml-2 opacity-30 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth={2.5}/></svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-3 px-6 opacity-40">
                    <span className="text-[9px] font-black uppercase tracking-widest">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{message.role === Role.USER ? 'Your Vision' : 'Advisor'}</span>
                  </div>
                </div>
              ))}
              
              {state.isLoading && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] rounded-tl-none px-10 py-8 shadow-sm flex items-center space-x-4">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-[#8BD658] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-[#3F6EC9] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-[#8BD658] rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Consulting Ecosystem...</span>
                  </div>
                </div>
              )}
              
              {state.error && (
                <div className="w-full p-8 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600 flex items-center space-x-6 animate-shake">
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest mb-1">System Obstacle</p>
                    <p className="text-lg font-bold">{state.error}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-20" />
            </div>
          </div>

          <div className="p-8 border-t border-slate-100 bg-white/80 backdrop-blur-xl z-30">
            <div className="max-w-5xl mx-auto relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#8BD658] to-[#3F6EC9] rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-20 transition duration-700"></div>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-[2.5rem] p-3 pr-5 focus-within:bg-white focus-within:border-[#3F6EC9]/30 transition-all shadow-sm">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Express your business objective..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xl py-5 px-8 outline-none text-slate-800 placeholder:text-slate-300 font-medium"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || state.isLoading}
                  className="p-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-slate-800 disabled:opacity-20 transition-all active:scale-95 shadow-xl group/send"
                >
                  <svg className="w-6 h-6 group-hover/send:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-w-5xl mx-auto mt-6 flex items-center justify-between px-6">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">
                2026 Strategic Forecasting Engine
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8BD658]"></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Operational</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F6EC9]"></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
