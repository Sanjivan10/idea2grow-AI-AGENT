
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
      const history = state.messages.map(m => ({
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
        error: "Strategic sensor error: Please ensure the 'API_KEY' environment variable is correctly configured in your deployment settings.",
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
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#8BD658]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#3F6EC9]/5 rounded-full blur-[120px]"></div>
      </div>

      {!isStarted ? (
        /* LANDING VIEW */
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-6 min-h-screen animate-slide-in">
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="p-4 mb-8 bg-white/50 rounded-3xl border border-slate-50 shadow-sm">
              <Logo className="w-24 h-24 drop-shadow-sm" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-[1.1]">
              Strategic Ideas <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8BD658] via-[#3F6EC9] to-[#8BD658] bg-[length:200%_auto] animate-gradient-flow">
                to Grow Your Vision
              </span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Surveying <span className="text-slate-900 font-bold border-b-2 border-[#8BD658]/20">idea2grow.com</span> for real-time business insights and trending 2026 growth strategies.
            </p>
          </div>

          <div className="w-full max-w-3xl relative group mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8BD658]/30 to-[#3F6EC9]/30 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-700"></div>
            <div className="relative flex items-center bg-white border border-slate-200 shadow-[0_30px_60px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-3 pr-5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="What business idea should we explore?"
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl md:text-2xl py-5 px-8 outline-none text-slate-800 placeholder:text-slate-300"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || state.isLoading}
                className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
                  input.trim() && !state.isLoading 
                    ? 'bg-slate-900 text-white shadow-xl hover:scale-105 active:scale-95' 
                    : 'bg-slate-50 text-slate-200'
                }`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="text-base font-semibold text-left px-8 py-6 border border-slate-100 rounded-2xl bg-white/40 hover:bg-white hover:border-[#8BD658]/40 hover:shadow-lg transition-all duration-300 text-slate-600 hover:text-slate-900 group flex items-center justify-between"
              >
                <span>{suggestion}</span>
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all text-[#8BD658]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* CHAT VIEW */
        <div className="relative z-10 flex flex-col w-full max-w-5xl h-screen px-4 md:px-8">
          <header className="py-6 flex items-center justify-between border-b border-slate-50 bg-white/50 backdrop-blur-md sticky top-0 z-20">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all group"
              onClick={() => { setIsStarted(false); setState(prev => ({ ...prev, messages: [] })); }}
            >
              <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
              <div className="hidden sm:block">
                <span className="font-black text-xl tracking-tighter block leading-none text-slate-900">Idea<span className="text-[#8BD658]">2</span>Grow</span>
                <span className="text-[9px] text-[#3F6EC9] font-black tracking-widest uppercase">Strategic Intelligence</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50/50 rounded-full border border-slate-100">
              <span className="w-2 h-2 bg-[#8BD658] rounded-full animate-pulse shadow-[0_0_8px_#8BD658]"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Search Grounding</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pt-10 pb-44 space-y-16 no-scrollbar">
            {state.messages.map((msg) => (
              <div key={msg.id} className="animate-slide-in">
                <div className="flex gap-6 md:gap-12 max-w-4xl mx-auto">
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                    msg.role === Role.USER ? 'bg-[#3F6EC9]' : 'bg-white border border-slate-100'
                  }`}>
                    {msg.role === Role.USER ? (
                      <span className="text-[10px] text-white font-black">USER</span>
                    ) : (
                      <Logo className="w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="prose prose-slate max-w-none">
                      {msg.role === Role.MODEL ? (
                        <div className="space-y-1">
                          {renderMessageContent(msg.content)}
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-slate-900 tracking-tight leading-snug">{msg.content}</p>
                      )}
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-12 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                            Verification Sources
                          </h4>
                          <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {msg.sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-4 bg-white border border-slate-100 rounded-xl hover:border-[#8BD658] transition-all flex flex-col gap-1.5 shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black text-[#3F6EC9] uppercase tracking-widest">WEB LINK</span>
                                <svg className="w-3 h-3 text-slate-300 group-hover:text-[#8BD658]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                              <p className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-slate-950 transition-colors">{source.title}</p>
                              <p className="text-[9px] text-slate-400 truncate">{source.uri}</p>
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
              <div className="max-w-4xl mx-auto flex gap-6 md:gap-12">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-4 pt-2">
                  <div className="h-4 bg-slate-50 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-50 rounded-full w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse"></div>
                  <div className="flex items-center gap-3 pt-6">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BD658] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8BD658]"></span>
                    </span>
                    <p className="text-[10px] font-black text-[#8BD658] uppercase tracking-[0.25em]">Synthesizing Growth Data...</p>
                  </div>
                </div>
              </div>
            )}

            {state.error && (
              <div className="max-w-2xl mx-auto p-8 bg-red-50/50 border border-red-100 text-red-600 text-sm font-bold rounded-3xl text-center shadow-sm animate-slide-in">
                {state.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Persistent Search Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-8 md:p-12 pointer-events-none">
            <div className="max-w-3xl mx-auto w-full pointer-events-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#8BD658]/20 to-[#3F6EC9]/20 rounded-[2rem] blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center bg-white border border-slate-200 shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2rem] p-2 pr-4 transition-all focus-within:border-slate-300">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask another strategic question..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-5 px-8 outline-none text-slate-800"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || state.isLoading}
                    className={`p-4 rounded-2xl transition-all duration-300 ${
                      input.trim() && !state.isLoading 
                        ? 'bg-slate-900 text-white shadow-lg hover:scale-105 active:scale-95' 
                        : 'bg-slate-50 text-slate-200'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-center text-[9px] text-slate-400 mt-5 font-black uppercase tracking-[0.3em] opacity-50">
                Powered by <span className="text-slate-900">Idea2Grow Strategic AI</span> &bull; 2026 Ready
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
