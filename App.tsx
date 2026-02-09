import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, ChatState } from './types';
import { geminiService } from './services/geminiService';
import { Logo } from './constants';

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
    <div className={`relative flex flex-col bg-white border border-slate-200 rounded-[24px] transition-all duration-300 w-full ${!isHeader ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)]' : 'shadow-sm'}`}>
      <div className="flex items-start px-5 pt-4">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a strategic growth question..."
          aria-label="Search input"
          className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] md:text-[17px] py-1 outline-none text-slate-800 placeholder:text-slate-400 font-normal resize-none overflow-y-auto no-scrollbar"
        />
      </div>

      <div className="flex items-center justify-between px-5 pb-3 mt-1">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => handleSend("Give me a site analysis of idea2grow.com")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors text-[11px] font-bold uppercase tracking-wider border border-slate-100"
          >
            Site Analysis
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all active:scale-95"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
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
    { label: "Business Scaling", prompt: "How do I scale a small business efficiently?" },
    { label: "Marketing Insights", prompt: "What are the latest digital marketing trends for 2024?" },
    { label: "Growth Strategy", prompt: "What are the top 3 strategies for brand growth right now?" }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#fcfdfe] p-6 items-center justify-center animate-slide-in">
      <div className="w-full max-w-[720px] flex flex-col items-center">
        <div className="mb-8">
          <Logo className="w-16 h-16" />
        </div>
        
        <div className="flex flex-col items-center text-center mb-10 w-full px-4">
          <h1 className="text-3xl md:text-[54px] font-black text-slate-900 leading-tight tracking-tight">
            How can I help your ideas grow?
          </h1>
          <p className="mt-4 text-slate-500 text-lg font-medium">AI Strategic Assistant by idea2grow.com</p>
        </div>

        <div className="w-full px-2 mb-8">
          <SearchBar 
            input={input} 
            setInput={setInput} 
            handleSend={handleSend}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(s.prompt)}
              className="px-5 py-2.5 rounded-full bg-white text-slate-700 text-[13px] font-bold border border-slate-200 hover:border-slate-800 hover:shadow-sm transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        Idea2grow • The future of growth
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
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "The engine encountered a technical error. Please check your connection and API settings."
      }));
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold markdown formatting
      const styledLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
      
      // List handling
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const listContent = styledLine.trim().substring(2);
        return (
          <li key={i} className="ml-5 mb-2 list-disc text-slate-700 leading-relaxed text-[15px]">
            <span dangerouslySetInnerHTML={{ __html: listContent }} />
          </li>
        );
      }
      
      if (!line.trim()) return <div key={i} className="h-3" />;
      
      return (
        <p key={i} className="mb-3 text-slate-700 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: styledLine }} />
      );
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
      <header className="px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsStarted(false); setState({ messages: [], isLoading: false, error: null }); }}>
          <Logo className="w-6 h-6" />
          <span className="font-black text-sm uppercase tracking-[0.2em] text-slate-900">Idea2grow</span>
        </div>
        <button 
          type="button"
          onClick={() => { setIsStarted(false); setState({ messages: [], isLoading: false, error: null }); }}
          className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all"
        >
          Clear Chat
        </button>
      </header>

      <main className="flex-1 overflow-y-auto bg-white no-scrollbar">
        <div className="max-w-3xl mx-auto w-full py-12 px-6 space-y-12">
          {state.messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === Role.USER ? 'justify-end' : 'justify-start'} animate-slide-in`}>
              <div className={`max-w-[90%] md:max-w-[85%] ${message.role === Role.USER ? 'bg-slate-50 border border-slate-100' : 'bg-transparent'} rounded-[24px] px-6 py-5`}>
                <div className="text-[15px]">
                  {message.role === Role.USER ? (
                    <span className="text-slate-900 font-semibold">{message.content}</span>
                  ) : renderMessageContent(message.content)}
                </div>

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2 pt-5 border-t border-slate-100">
                    <span className="w-full text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Sources Found</span>
                    {message.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-[11px] font-bold text-slate-600 transition-all border border-slate-100">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {source.title || 'Insight Source'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {state.isLoading && (
            <div className="flex items-center gap-1.5 pl-6">
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          )}

          {state.error && (
            <div className="mx-auto flex flex-col items-center gap-5 p-8 bg-red-50/30 border border-red-100 rounded-[32px] max-w-lg">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <p className="text-[13px] font-bold text-red-900 text-center leading-relaxed">{state.error}</p>
              <button 
                onClick={() => handleSend(lastInput)} 
                className="text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Retry Insight Generation
              </button>
            </div>
          )}
          <div ref={messagesEndRef} className="h-20" />
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md p-6 pb-10 sticky bottom-0 z-40 border-t border-slate-50">
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