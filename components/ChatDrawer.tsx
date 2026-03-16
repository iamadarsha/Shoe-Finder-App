import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithSoleMate } from '../services/gemini';

interface ChatDrawerProps {
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  onClose: () => void;
}

function normalizeAssistantContent(content: string): string {
  return String(content || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderMessageContent(msg: ChatMessage) {
  if (msg.role === 'user') {
    return <span className="whitespace-pre-wrap">{msg.content}</span>;
  }

  const content = normalizeAssistantContent(msg.content);
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
  const hasList = lines.some((line) => /^([-•]|\d+[.)])\s+/.test(line));

  if (!hasList) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const match = line.match(/^([-•]|\d+[.)])\s+(.*)$/);
        if (match) {
          return (
            <div key={index} className="flex gap-2">
              <span style={{ color: '#A78BFA' }}>•</span>
              <span>{match[2]}</span>
            </div>
          );
        }
        return <div key={index}>{line}</div>;
      })}
    </div>
  );
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
        className={`absolute inset-0 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div
        className={`relative w-full sm:w-[420px] h-full flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#0A0A0F', borderLeft: '1px solid #1A1A2A' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #1A1A2A' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #00E59B)' }}
            >
              🤖
            </div>
            <span className="text-base font-semibold" style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}>
              SoleMate AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E59B] animate-pulse" />
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
            style={{ color: '#8888A0' }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👟</div>
              <p className="text-sm mb-2" style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}>
                Ask me anything about running shoes
              </p>
              <p className="text-xs" style={{ color: '#44445A', fontFamily: "'Figtree', sans-serif" }}>
                Short, practical answers. I ask one follow-up at a time.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {[
                  'Daily trainer under ₹7,000',
                  'Nike Vomero 18 vs Asics Gel-Nimbus 26',
                  'My knees hurt while running. What should I look for?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-2 rounded-lg text-xs transition-all hover:bg-white/5"
                    style={{
                      border: '1px solid #1A1A2A',
                      color: '#8888A0',
                      fontFamily: "'Figtree', sans-serif",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? '#7C5CFC' : '#181824',
                  color: msg.role === 'user' ? 'white' : '#E8E8ED',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
                  fontFamily: "'Figtree', sans-serif",
                }}
              >
                {renderMessageContent(msg)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl flex gap-1" style={{ background: '#181824' }}>
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7C5CFC', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7C5CFC', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7C5CFC', animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid #1A1A2A' }}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any running shoe..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-[#7C5CFC44] disabled:opacity-50"
              style={{
                background: '#0C0C12',
                border: '1px solid #1A1A2A',
                color: '#E8E8ED',
                fontFamily: "'Figtree', sans-serif",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-30"
              style={{
                background: 'linear-gradient(135deg, #7C5CFC, #6B4EE8)',
                color: 'white',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
