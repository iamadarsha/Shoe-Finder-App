import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithSoleMate } from '../services/gemini';

interface ChatDrawerProps {
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  onClose: () => void;
}

export default function ChatDrawer({ messages, setMessages, onClose }: ChatDrawerProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatWithSoleMate(messages, trimmed);
      setMessages([...newMessages, { role: 'assistant', content: reply, timestamp: Date.now() }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.', timestamp: Date.now() },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 bg-black/60 backdrop-blur-[4px] ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div
        className={`relative w-full md:w-[400px] h-full flex flex-col transition-transform duration-300 ease-out bg-[#050507] border-l border-[#1A1A2A] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0A0A0F] border-b border-[#1A1A2A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br from-[#7C5CFC] to-[#00C896] shadow-[0_2px_10px_rgba(124,92,252,0.3)]">
              🤖
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#E8E8ED] font-heading tracking-wide">
                SoleMate AI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 text-[#8888A0] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-[#050507]">
          {messages.length === 0 && (
            <div className="text-center py-12 px-2">
              <div className="text-4xl mb-4 opacity-80">👟</div>
              <p className="text-sm mb-2 text-[#E8E8ED] font-heading font-semibold">
                Ask me anything about running shoes
              </p>
              <p className="text-xs text-[#8888A0] font-body leading-relaxed mb-6">
                I know foam tech, gait types, Indian pricing, & brand specifics.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  'Best shoes for flat feet under ₹10K?',
                  'Nike Vomero 18 vs Asics Gel-Nimbus 26?',
                  'Which Hoka for marathon training?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs transition-all text-left bg-[#111118] hover:bg-[#1A1A2A] border border-[#1A1A2A] hover:border-[#2A2A40] text-[#8888A0] hover:text-[#E8E8ED] font-body"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex ${isUser ? 'justify-end' : 'justify-start gap-2'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#00C896] shrink-0 mt-1 shadow-sm">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed font-body ${
                    isUser
                      ? 'bg-[#1A1A2A] text-[#E8E8ED] rounded-2xl rounded-tr-sm'
                      : 'bg-[#7C5CFC15] border border-[#7C5CFC30] text-[#E8E8ED] rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#00C896] shrink-0 mt-1 shadow-sm">
                🤖
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center bg-[#7C5CFC15] border border-[#7C5CFC30]">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#7C5CFC]" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#7C5CFC]" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#7C5CFC]" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-4 bg-[#0A0A0F] border-t border-[#1A1A2A]">
          <div className="flex gap-2 relative items-end">
            <textarea
              ref={inputRef as any}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any running shoe..."
              disabled={loading}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-1 focus:border-[#7C5CFC] focus:ring-[#7C5CFC44] disabled:opacity-50 bg-[#111118] border border-[#1A1A2A] text-[#E8E8ED] font-body resize-none min-h-[46px] max-h-[120px] scrollbar-hide"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-30 bg-gradient-to-br from-[#7C5CFC] to-[#6B4EE8] text-white hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(124,92,252,0.3)] shrink-0 h-[46px]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-[#55556A] font-body">
            SoleMate AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
