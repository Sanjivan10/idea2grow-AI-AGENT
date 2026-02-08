
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, ChatState } from './types';
import { geminiService } from './services/geminiService';
import { Logo, COLORS } from './constants';

interface SearchBarProps {
  isHeader?: boolean;
  input: string;
  setInput: (val: string) => void;
  handleSend: (override?: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  isHeader = false, 
  input, 
  setInput, 
  handleSend, 
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`relative flex flex-col bg-white border border-slate-200 rounded-[28px] transition-all duration-300 w-full ${!isHeader ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)]' : 'shadow-sm'}`}>
      <div className="flex items-start px-5 pt-4">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Idea2grow..."
          aria-label="Search input"
          className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] md:text-[17px] py-1 outline-none text-slate-800 placeholder:text-slate-400 font-normal resize-none overflow-y-auto no-scrollbar"
        />
        <div className="flex items-center pt-1 pr-1">
          <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full"></div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-3 mt-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleSend("Create a growth plan")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors text-[13px] font-medium"
          >
            Create
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleSend("Write anything about scaling")}
            className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors text-[13px] font-medium"
          >
            Write anything
          </button>
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-all active:scale-95"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen: React.FC<{ 
  input: string; 
  setInput: (val: string) => void; 
  handleSend: (override?: string) => void; 
}> = ({ input, setInput, handleSend }) => {
  const suggestions = [
    { label: "Write anything", prompt: "Write a business strategy summary" },
    { label: "Help me learn", prompt: "Help me learn about digital marketing" },
    { label: "Boost my day", prompt: "Give me an inspirational growth idea" }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8fafc] p-6 items-center justify-center animate-slide-in">
      <div className="w-full max-w-[760px] flex flex-col items-center">
        {/* Greeting Section */}
        <div className="flex flex-col items-center text-center mb-10 w-full px-4">
          <h1 className="text-3xl md:text-[44px] font-medium text-slate-800 leading-tight">
            I can make your ideas grow?
          </h1>
        </div>

        {/* Central Search Bar */}
        <div className="w-full px-2 mb-8">
          <SearchBar 
            input={input} 
            setInput={setInput} 
            handleSend={handleSend}
          />
        </div>

        {/* Pill Suggestions */}
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s.prompt)}
              className="px-5 py-2.5 rounded-full bg-white text-slate-700 text-[14px] font-medium border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Absolute Logo branding */}
      <div className="absolute top-8 left-8 flex items-center gap-2.5 opacity-60">
        <Logo className="w-5 h-5" />
        <span className="font-bold text-sm tracking-tight text-slate-800">Idea2grow</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [input, setInput] = useState('');
  const [lastInput, setLastInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isStarted) {
      scrollToBottom();
    }
  }, [state.messages, isStarted, state.isLoading, scrollToBottom]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = (overrideInput || input).trim();
    if (!textToSend || state.isLoading) return;

    if (!isStarted) setIsStarted(true);
    setLastInput(textToSend);

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
      let errorMessage = "Interrupted. Please try again.";
      const errString = String(err).toLowerCase();

      if (errString.includes("api_key") || errString.includes("401")) {
        errorMessage = "Authentication issue. Please verify API key.";
      } else if (errString.includes("network") || errString.includes("fetch")) {
        errorMessage = "Network issue. Please check connection.";
      } else if (errString.includes("429")) {
        errorMessage = "Too many requests. Please wait a moment.";
      }

      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let styledLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return <li key={i} className="ml-5 mb-2 list-disc text-slate-600 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: styledLine.trim().substring(2) }} />;
      }
      if (!line.trim()) return <div key={i} className="h-3" />;
      return <p key={i} className="mb-3 text-slate-600 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: styledLine }} />;
    });
  };

  if (!isStarted) {
    return (
      <WelcomeScreen 
        input={input} 
        setInput={setInput} 
        handleSend={handleSend} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <header className="px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-50 sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsStarted(false)}>
          <Logo className="w-5 h-5" />
          <span className="font-bold text-base tracking-tight text-slate-800">Idea2grow</span>
        </div>
        <button 
          onClick={() => { setIsStarted(false); setState({ messages: [], isLoading: false, error: null }); }}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          New Chat
        </button>
      </header>

      <main className="flex-1 overflow-y-auto bg-white no-scrollbar">
        <div className="max-w-2xl mx-auto w-full py-10 px-6 space-y-10">
          {state.messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.role === Role.USER ? 'flex-row-reverse' : 'flex-row'} animate-slide-in`}>
              <div className={`flex-1 ${message.role === Role.USER ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[90%] rounded-2xl px-5 py-3 ${
                  message.role === Role.USER ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-800'
                }`}>
                  <div className="text-[15px] leading-relaxed">
                    {message.role === Role.USER ? message.content : renderMessageContent(message.content)}
                  </div>
                </div>

                {message.sources && message.sources.length > 0 && (
                  <div className={`mt-3 flex flex-wrap gap-2 ${message.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                    {message.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-all border border-slate-100">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {source.title && source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title || 'Source'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {state.isLoading && (
            <div className="flex items-center gap-1.5 pl-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse [animation-delay:-.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:-.4s]"></div>
            </div>
          )}

          {state.error && (
            <div className="mx-auto flex flex-col items-center gap-2 p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100">
              <p className="text-[12px] font-bold uppercase tracking-wider text-center">{state.error}</p>
              <button onClick={() => handleSend(lastInput)} className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors">Retry</button>
            </div>
          )}
          <div ref={messagesEndRef} className="h-10" />
        </div>
      </main>

      <footer className="bg-white p-6 pb-10 sticky bottom-0 z-40 border-t border-slate-50">
        <div className="max-w-2xl mx-auto">
          <SearchBar 
            isHeader={true} 
            input={input} 
            setInput={setInput} 
            handleSend={handleSend}
            isLoading={state.isLoading}
          />
        </div>
      </footer>
    </div>
  );
};

export default App;
