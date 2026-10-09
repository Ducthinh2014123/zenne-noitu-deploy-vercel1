import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconSparkles, IconUser, IconRefresh, IconAlertTriangle } from '../../components/icons';

const SUGGESTIONS = [
  'Mẹo chơi nối từ Wikipedia luôn thắng?',
  'Quy tắc chøi game Nối Từ như thế nào?',
  'Giải thích câu ca dao: Có công mài sắt có ngày nên kim',
  'Tính đạo hàm của hàm số o = sin(2x)',
  'Viết một bài thơ ngắn về tình bạn',
];

export default function AiAskPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Mình là Trợ lý zenne-noitu của hệ thống Zenne Nối Từ. Bạn có câu hỏi hay thắc mắc gì cần giải đáp không?',
      time: '12:00',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionToSend) => {
    const q = (questionToSend || input || '').trim();
    if (!q || loading) return;

    setError('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: q, time: timeStr };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await pubApi.askAi(q);
      const botMsg = {
        role: 'assistant',
        content: res.answer || 'Không có câu trả lời.',
        model: res.model,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến zenne-noitu.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Đã làm mới cuộc hội thoại! Bạn có thể đặt cûu hỏi mới.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError('');
  };

  return (
    <PubLayout title="Hỏi AI zenne-noitu">
      <Head>
        <title>Hỏi AI zenne-noitu — Zenne Nối TỬ</title>
      </Head>

      <div className="max-w-4l mx-auto flex flex-col h-full min-h-[600px]">
        {/* Header card */}
        <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl flex items-center justify-between mb-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <IconSparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base">Trợ lý zenne-noitu</h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  zenne-noitu
                </span>
              </div>
              <p className="text-xs text-gray-400">Hỏi đáp thông minh, hỗ trợ luật chøi, kiến thức từ vựng & học tập</p>
            </div>
          </div>

          <button 
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 transition-colors"
            title="Làm mới cuộc trò chuyện"
          >
            <IconRefresh className="w-3.5 h-3.5" /> Làm mới
          </button>
        </div>

        {/* Chat box container */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner flex flex-col min-h-[380px] max-h-[550px]">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={idx}
                className={'flex gap-3 max-w-[85%] ' + (isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}
              >
                <div 
                  className={'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm shadow ' + (isUser ? 'bg-indigo-600 text-white' : 'bg-indigo-950 border border-indigo-700/50 text-indigo-300')}
                >
                  {isUser ? <IconUser className="w-4 h-4" /> : <IconSparkles className="w-4 h-4" />}
                </div>

                <div>
                  <div 
                    className={'p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ' + (isUser ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' : 'bg-gray-800/90 border border-gray-700/60 text-gray-200 rounded-tl-none shadow')}
                  >
                    {m.content}
                  </div>
                  <div className={'text-[10px] text-gray-500 mt-1 px-1 ' + (isUser ? 'text-right' : 'text-left')}>
                    {m.time} {m.model ? ' • ' + m.model : ''}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 text-indigo-300 flex items-center justify-center">
                <IconSparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 bg-gray-800/90 border border-gray-700/60 rounded-2xl rounded-tl-none text-sm text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-gray-400 ml-1">zenne-noitu đang suy ngh</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400 text-xs flex items-center gap-2">
              <IconAlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick suggestions */}
        <div className="py-2 overflow-x-auto flex gap-2 no-scrollbar">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="px-3 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-600/50 rounded-full text-xs text-gray-400 hover:text-white whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
            >
              💱 +s
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="mt-2 bg-gray-900 border border-gray-800 focus-within:border-indigo-500 rounded-2xl p-2 flex items-center gap-2 shadow-lg transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi cho AI... (Enter để gủi, Shift+Enter xuống dòng)"
            rows={1}
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none resize-none min-h-[38px] max-h-[120px]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            <IconSparkles className="w-4 h-4" /> Gửi
          </button>
        </div>
      </div>
    </PubLayout>
  );
}
