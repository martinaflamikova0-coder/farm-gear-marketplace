import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, ArrowLeft, Bot, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoEkiptrade from '@/assets/logo-ekiptrade.png';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Msg = { role: 'user' | 'assistant'; content: string };

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || 'Erreur du service');
      return;
    }

    if (!resp.body) { onError('Pas de réponse'); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (json === '[DONE]') { streamDone = true; break; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }
    onDone();
  } catch {
    onError('Erreur de connexion');
  }
}

type View = 'menu' | 'ai-chat';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('menu');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const whatsappNumber = '393773890872';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (view === 'ai-chat') inputRef.current?.focus();
  }, [view]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      onDelta: upsert,
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setMessages(prev => [...prev, { role: 'assistant', content: err }]);
        setIsLoading(false);
      },
    });
  }, [input, isLoading, messages]);

  const handleClose = () => {
    setIsOpen(false);
    setView('menu');
  };

  const openAiChat = () => {
    setView('ai-chat');
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t('chat.aiWelcome', 'Bonjour ! 👋 Comment puis-je vous aider ?') }]);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col bg-background" style={{ maxHeight: 'min(520px, calc(100vh - 8rem))' }}>
          {/* Header */}
          <div className="bg-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {view === 'ai-chat' && (
                <button onClick={() => setView('menu')} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors mr-1">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <img src={logoEkiptrade} alt="EkipTrade" className="h-8 w-auto rounded-full bg-white p-0.5" />
              <div>
                <p className="text-primary-foreground font-semibold text-sm">EkipTrade</p>
                <p className="text-primary-foreground/60 text-xs">
                  {view === 'ai-chat' 
                    ? t('chat.aiSubtitle', 'Assistant IA · 24/7') 
                    : t('chat.subtitle', 'Comment pouvons-nous vous aider ?')}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {view === 'menu' ? (
            <>
              {/* Menu body */}
              <div className="bg-background p-5 space-y-3 flex-1">
                <h3 className="text-center font-semibold text-foreground text-base mb-4">
                  {t('chat.title', 'Comment pouvons-nous vous aider ?')}
                </h3>

                {/* AI Chat option */}
                <button
                  onClick={openAiChat}
                  className="w-full flex items-center gap-4 bg-muted hover:bg-muted/80 rounded-xl p-4 transition-colors group text-left"
                >
                  <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                      {t('chat.aiOption', 'Discuter avec notre assistant')}
                    </p>
                    <p className="text-muted-foreground text-xs">{t('chat.aiLabel', 'IA · 24/7')}</p>
                  </div>
                </button>

                {/* Email option */}
                <a
                  href={`mailto:infos@ekiptrade.com?subject=${encodeURIComponent(t('chat.emailSubject', 'Demande depuis le site'))}`}
                  className="flex items-center gap-4 bg-muted hover:bg-muted/80 rounded-xl p-4 transition-colors group"
                >
                  <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0">
                    <ChatBubbleIcon />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                      {t('chat.emailOption', 'Envoyez-nous un email')}
                    </p>
                    <p className="text-muted-foreground text-xs">infos@ekiptrade.com</p>
                  </div>
                </a>

                {/* WhatsApp option */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-muted hover:bg-muted/80 rounded-xl p-4 transition-colors group"
                >
                  <div className="bg-[#25D366]/10 rounded-full p-2.5 flex-shrink-0">
                    <WhatsAppIcon />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                      {t('chat.whatsappOption', 'Contacter via WhatsApp')}
                    </p>
                    <p className="text-muted-foreground text-xs">WhatsApp</p>
                  </div>
                </a>
              </div>

              {/* Footer */}
              <div className="bg-background border-t border-border px-5 py-3 flex-shrink-0">
                <p className="text-center text-muted-foreground text-xs">Powered by EkipTrade</p>
              </div>
            </>
          ) : (
            <>
              {/* AI Chat messages */}
              <div className="bg-background flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-background border-t border-border p-3 flex-shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('chat.placeholder', 'Écrivez votre message...')}
                    className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-primary text-primary-foreground rounded-xl p-2.5 hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
        aria-label="Chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
};

export default ChatWidget;
