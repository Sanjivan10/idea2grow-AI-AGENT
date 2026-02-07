
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, ChatState } from './types';
import { geminiService } from './services/geminiService';
import { Logo, COLORS } from './constants';

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
    inputRef.current?.focus();
  }, []);

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
      const history = state.messages.map(m => ({
        role: m.role,
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
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to gather insights. Please try again.",
      }));
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let styledLine = line;
      styledLine = styledLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={i} className="ml-6 mb-2 list-disc text-slate-700" dangerouslySetInnerHTML={{ __html: styledLine.trim().substring(2) }} />
        );
      }
      if (!line.trim()) return <div key={i} className="h-4" />;
      return <p key={i} className="mb-3 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: styledLine }} />;
    });
  };

  const suggestions = [
    "Trending social media topics for growth",
    "Forward-thinking business ideas for 2026",
    "High-impact AI platforms and emerging roles",
    "New blog posts from idea2grow.com"
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-green-100 flex flex-col items-center">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#8BD658]/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#3F6EC9]/10 rounded-full blur-[140px]"></div>
      </div>

      {!isStarted ? (
        /* LANDING VIEW - FULL SCREEN SEARCH */
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-6 min-h-screen animate-slide-in">
          <div className="mb-12 flex flex-col items-center">
            <div className="p-4 mb-8">
              <Logo className="w-28 h-28 drop-shadow-md" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-center mb-6">
              How can I help you today <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8BD658] via-[#3F6EC9] to-[#8BD658] bg-[length:200%_auto] animate-gradient-flow">
                with new ideas?
              </span>
            </h1>
            <p className="text-slate-500 text-lg md:text-2xl text-center max-w-3xl font-medium leading-relaxed">
              Explore trending topics, 2026 business vision, and AI platforms from <span className="text-slate-900 font-bold underline decoration-[#8BD658]/30">idea2grow.com</span>.
            </p>
          </div>

          {/* Large Hero Search Bar */}
          <div className="w-full max-w-3xl relative group mb-16">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8BD658] to-[#3F6EC9] rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-center bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-3 pr-5 transition-all focus-within:ring-4 focus-within:ring-[#8BD658]/5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your growth query here..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-2xl py-5 px-8 outline-none text-slate-800 placeholder:text-slate-300"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || state.isLoading}
                className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
                  input.trim() && !state.isLoading 
                    ? 'bg-slate-900 text-white shadow-xl hover:scale-105 active:scale-95' 
                    : 'bg-slate-50 text-slate-300'
                }`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Clean Suggestion Cards - Matching Screenshot Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="text-lg font-medium text-left px-8 py-7 border border-slate-100 rounded-3xl bg-white/60 hover:bg-white hover:border-[#8BD658]/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-slate-600 hover:text-slate-900 group flex items-center justify-between"
              >
                <span>{suggestion}</span>
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-[#8BD658]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* CHAT / SEARCH RESULTS VIEW */
        <div className="relative z-10 flex flex-col w-full max-w-5xl h-screen px-4 md:px-8">
          <header className="py-8 flex items-center justify-between border-b border-slate-100">
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all group"
              onClick={() => { setIsStarted(false); setState(prev => ({ ...prev, messages: [] })); }}
            >
              <Logo className="w-12 h-12 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-extrabold text-2xl tracking-tighter block leading-none">Idea<span className="text-[#8BD658]">2</span>Grow</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Strategic AI</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <span className="w-2 h-2 bg-[#8BD658] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Real-Time Search Enabled</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pt-10 pb-40 space-y-16 no-scrollbar">
            {state.messages.map((msg) => (
              <div key={msg.id} className="animate-slide-in">
                <div className="flex gap-6 md:gap-10 max-w-4xl mx-auto">
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                    msg.role === Role.USER ? 'bg-[#3F6EC9]' : 'bg-white border border-slate-100'
                  }`}>
                    {msg.role === Role.USER ? (
                      <span className="text-[10px] text-white font-black tracking-tighter">YOU</span>
                    ) : (
                      <Logo className="w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="prose prose-slate max-w-none">
                      {msg.role === Role.MODEL ? renderMessageContent(msg.content) : (
                        <p className="text-2xl font-semibold text-slate-800 leading-tight tracking-tight">{msg.content}</p>
                      )}
                    </div>

                    {/* Grounding Source Cards */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-12">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-px bg-slate-100 flex-1"></div>
                          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] whitespace-nowrap">Verification Data</h4>
                          <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {msg.sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#8BD658] hover:shadow-[0_15px_35px_rgba(0,0,0,0.05)] transition-all flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-[#3F6EC9] uppercase tracking-widest">Source {idx + 1}</span>
                                <svg className="w-3 h-3 text-slate-300 group-hover:text-[#8BD658] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1">{source.title}</p>
                              <p className="text-[9px] text-slate-400 truncate mt-1">{source.uri}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {state.isLoading && (
              <div className="max-w-4xl mx-auto flex gap-6 md:gap-10 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex-shrink-0" />
                <div className="flex-1 space-y-6 pt-3">
                  <div className="h-5 bg-slate-50 rounded-lg w-4/5"></div>
                  <div className="h-5 bg-slate-50 rounded-lg w-2/3"></div>
                  <div className="h-5 bg-slate-50 rounded-lg w-full"></div>
                  <div className="flex items-center gap-2 pt-4">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BD658] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8BD658]"></span>
                    </span>
                    <p className="text-[10px] font-black text-[#8BD658] uppercase tracking-[0.2em]">Crawling idea2grow.com archives...</p>
                  </div>
                </div>
              </div>
            )}

            {state.error && (
              <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-3xl text-center shadow-sm">
                {state.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Search Bar in Chat View */}
          <div className="fixed bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
            <div className="max-w-3xl mx-auto w-full pointer-events-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#8BD658] to-[#3F6EC9] rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition"></div>
                <div className="relative flex items-center bg-white border border-slate-200 shadow-[0_30px_60px_rgba(0,0,0,0.1)] rounded-[2rem] p-2 pr-4 transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Search for more ideas or YouTube videos..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 px-7 outline-none text-slate-800"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || state.isLoading}
                    className={`p-4 rounded-2xl transition-all ${
                      input.trim() && !state.isLoading 
                        ? 'bg-slate-900 text-white shadow-lg hover:scale-105 active:scale-95' 
                        : 'bg-slate-50 text-slate-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-center text-[9px] text-slate-300 mt-4 font-bold uppercase tracking-[0.2em]">
                Live Search Optimized for <span className="text-slate-500">2026 Projections</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
