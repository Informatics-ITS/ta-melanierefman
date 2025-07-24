import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { Typography } from "../../atom/typography";
import { useTranslation } from 'react-i18next';

const Chatbot: React.FC = () => {
  const { t } = useTranslation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isFirstMessageVisible, setIsFirstMessageVisible] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{ role: "assistant", content: t('chat_helper') }]);
        setIsFirstMessageVisible(true);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${baseUrl}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan. Silakan coba lagi." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatContent = (content: string) => {
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const urlRegex = /(\bhttps?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    content = content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-secondary underline">${url}</a>`;
    });
  
    const lines = content.split('\n');
    let inList = false;
    const formattedLines = lines.map(line => {
      if (/^\s*\* (.+)/.test(line)) {
        const item = line.match(/^\s*\* (.+)/)?.[1];
        if (!inList) {
          inList = true;
          return `<ul class="list-disc pl-5"><li>${item}</li>`;
        }
        return `<li>${item}</li>`;
      } else {
        if (inList) {
          inList = false;
          return `</ul>\n${line}`;
        }
        return line;
      }
    });
    if (inList) {
      formattedLines.push('</ul>');
    }
  
    return formattedLines.join('\n');
  };  

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-70 text-white rounded-full flex items-center justify-center shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[450px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-300">
          <div className="flex justify-between items-center p-3 border-b">
            <Typography type="body" weight="semibold" className="text-typo">
              {t('chat')}
            </Typography>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-typo-white2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl text-sm max-w-[75%] break-words ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-typo-inline text-typo-secondary'
                  } ${isFirstMessageVisible ? 'animate-fade-in' : ''}`}
                >
                  <Typography
                    type="caption1"
                    font="dm-sans"
                    weight={msg.role === 'user' ? 'medium' : 'regular'}
                    className={msg.role === 'user' ? 'text-white' : 'text-typo'}
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                </div>
              </div>            
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-xl text-sm max-w-[75%] bg-typo-inline text-typo-secondary animate-pulse">
                  <Typography
                    type="caption1"
                    font="dm-sans"
                    weight="regular"
                    className="text-typo"
                  >
                    {t('mengetik')}
                  </Typography>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="w-full p-2 border rounded-lg text-sm"
              placeholder={t('pertanyaan')}
              disabled={isTyping}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;