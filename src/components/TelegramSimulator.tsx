import React, { useState, useEffect, useRef } from 'react';
import { BotChatMessage, BankInfo } from '../types';
import { Send, Bot, RotateCcw, Sparkles, ExternalLink, CornerDownLeft, ShieldCheck, CheckCheck, Menu, X, Copy, Check, PhoneCall, HelpCircle, Calculator, Clock, CreditCard, Landmark, Globe, Hash, ArrowRightLeft, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';

interface TelegramSimulatorProps {
  initialBank?: BankInfo | null;
}

interface CommandItem {
  cmd: string;
  nameBn: string;
  descBn: string;
  icon: React.ReactNode;
  category: string;
}

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({ initialBank }) => {
  const [messages, setMessages] = useState<BotChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `👋 আসসালামু আলাইকুম!\n\n🇧🇩 *বাংলাদেশ ব্যাংক তথ্যভাণ্ডার ও টেলিগ্রাম বটে স্বাগতম!*\nএখানে আপনি বাংলাদেশের সকল তফসিলি ও বিশেষায়িত ব্যাংকের হেল্পলাইন, রাউটিং নম্বর, সুইফট কোড, ইন্টারনেট ব্যাংকিং, কার্ড সাপোর্ট ও বিকাশ ট্রান্সফার সংক্রান্ত বিস্তারিত তথ্য পাবেন।\n\n📸 *ছবি বা ডকুমেন্ট আপলোড:* আপনি ব্যাংকিং চেক, রসিদ বা কার্ডের যেকোনো ছবি আপলোড করেও তথ্য যাচাই করতে পারেন।\n\n👇 *যে তথ্যটি জানতে চান নিচের বাটনে চাপুন অথবা কমান্ড পাঠান:*`,
      buttons: [
        { text: '🏛️ সকল ব্যাংক (Categories)', callbackData: 'cmd:categories' },
        { text: '📞 ২৪/৭ হেল্পলাইন হটলাইন', callbackData: 'cmd:helpline' },
        { text: '🔢 রাউটিং নম্বর ফাইন্ডার', callbackData: 'cmd:routing' },
        { text: '🌐 SWIFT / রেমিট্যান্স কোড', callbackData: 'cmd:swift' },
        { text: '📲 বিকাশ/NPSB ট্রান্সফার', callbackData: 'cmd:bkash' },
        { text: '🕌 ইসলামিক শরীয়াহ ব্যাংক', callbackData: 'cmd:islamic' },
        { text: '💳 জরুরি কার্ড ব্লক হটলাইন', callbackData: 'cmd:cardblock' },
        { text: '⏰ ব্যাংক লেনদেন সময়সূচি', callbackData: 'cmd:timings' },
        { text: '🧮 লোন ও ডিপিএস ক্যালকুলেটর', callbackData: 'cmd:calc' },
        { text: '⚖️ বাংলাদেশ ব্যাংক অভিযোগ (16236)', callbackData: 'cmd:complaint' },
        { text: '📖 বট কমান্ড সহায়িকা (/help)', callbackData: 'cmd:help' }
      ],
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const telegramCommands: CommandItem[] = [
    { cmd: '/start', nameBn: 'মূল মেনু', descBn: 'বটের মূল অ্যাকশন ও ড্যাশবোর্ড', icon: <Bot className="w-4 h-4 text-emerald-400" />, category: 'প্রধান' },
    { cmd: '/banks', nameBn: 'সকল ব্যাংক', descBn: 'ক্যাটাগরি অনুযায়ী ৬১টি ব্যাংক', icon: <Landmark className="w-4 h-4 text-sky-400" />, category: 'প্রধান' },
    { cmd: '/helpline', nameBn: '২৪/৭ হেল্পলাইন', descBn: 'সকল ব্যাংকের হটলাইন নম্বর', icon: <PhoneCall className="w-4 h-4 text-amber-400" />, category: 'যোগাযোগ' },
    { cmd: '/cardblock', nameBn: 'কার্ড ব্লক হটলাইন', descBn: 'জরুরি কার্ড বাতিলের হটলাইন', icon: <CreditCard className="w-4 h-4 text-rose-400" />, category: 'জরুরি' },
    { cmd: '/swift', nameBn: 'SWIFT কোড', descBn: 'আন্তর্জাতিক রেমিট্যান্স কোড', icon: <Globe className="w-4 h-4 text-cyan-400" />, category: 'রেমিট্যান্স' },
    { cmd: '/routing', nameBn: 'রাউটিং নম্বর', descBn: 'BEFTN ও NPSB রাউটিং কোড', icon: <Hash className="w-4 h-4 text-purple-400" />, category: 'ফান্ড ট্রান্সফার' },
    { cmd: '/bkash', nameBn: 'বিকাশ ট্রান্সফার', descBn: 'বিকাশ ও NPSB সাপোর্ট ব্যাংক', icon: <ArrowRightLeft className="w-4 h-4 text-pink-400" />, category: 'ফান্ড ট্রান্সফার' },
    { cmd: '/islamic', nameBn: 'ইসলামিক ব্যাংক', descBn: '১০টি শরীয়াহ ভিত্তিক ব্যাংক', icon: <Landmark className="w-4 h-4 text-green-400" />, category: 'ক্যাটাগরি' },
    { cmd: '/govt', nameBn: 'সরকারি ব্যাংক', descBn: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক', icon: <Landmark className="w-4 h-4 text-blue-400" />, category: 'ক্যাটাগরি' },
    { cmd: '/foreign', nameBn: 'বিদেশি ব্যাংক', descBn: 'আন্তর্জাতিক বাণিজ্যিক ব্যাংক', icon: <Globe className="w-4 h-4 text-indigo-400" />, category: 'ক্যাটাগরি' },
    { cmd: '/timings', nameBn: 'ক্লিয়ারিং সময়সূচি', descBn: 'BEFTN, NPSB ও RTGS সময়', icon: <Clock className="w-4 h-4 text-orange-400" />, category: 'তথ্য' },
    { cmd: '/weekend', nameBn: 'সাপ্তাহিক ছুটি নোটিশ', descBn: 'শুক্রবার ও শনিবার ব্যাংক বন্ধের তথ্য', icon: <Clock className="w-4 h-4 text-rose-400" />, category: 'তথ্য' },
    { cmd: '/complaint', nameBn: 'অভিযোগ সেল', descBn: 'বাংলাদেশ ব্যাংক হেল্পলাইন 16236', icon: <ShieldCheck className="w-4 h-4 text-red-400" />, category: 'সুরক্ষা' },
    { cmd: '/calc', nameBn: 'লোন ক্যালকুলেটর', descBn: 'মাসিক কিস্তি (EMI) হিসাব', icon: <Calculator className="w-4 h-4 text-yellow-400" />, category: 'টুলস' },
    { cmd: '/ticket', nameBn: 'সাপোর্ট টিকিট', descBn: 'সকল সক্রিয় অনুসন্ধানের তালিকা', icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />, category: 'সাপোর্ট' },
    { cmd: '/status', nameBn: 'টিকিট স্ট্যাটাস', descBn: 'টিকিটের বর্তমান অগ্রগতি ও প্রতিনিধির রিপ্লাই', icon: <Clock className="w-4 h-4 text-emerald-400" />, category: 'সাপোর্ট' },
    { cmd: '/help', nameBn: 'ব্যবহার বিধি', descBn: 'সকল কমান্ডের বিস্তারিত তালিকা', icon: <HelpCircle className="w-4 h-4 text-teal-400" />, category: 'তথ্য' }
  ];


  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If incoming bank was requested to view in bot
  useEffect(() => {
    if (initialBank) {
      handleSendMessage(`/search ${initialBank.shortCode}`);
    }
  }, [initialBank]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setPendingImage(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string, callbackData?: string) => {
    const text = textToSend !== undefined ? textToSend : inputQuery.trim();
    const imageToSend = pendingImage;
    if (!text && !callbackData && !imageToSend) return;

    if (!callbackData && (text || imageToSend)) {
      // Append user message
      const userMsg: BotChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: text,
        imageUrl: imageToSend || undefined,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);
      setInputQuery('');
      setPendingImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    setIsLoading(true);
    setIsMenuOpen(false);

    try {
      const res = await fetch('/api/bot/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: callbackData ? undefined : (text || undefined),
          callbackData: callbackData,
          hasPhoto: Boolean(imageToSend),
          caption: text || undefined,
          fromName: 'User'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch bot response');
      }

      const data = await res.json();

      const botReply: BotChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        buttons: data.buttons || [],
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ বট সার্ভারে সংযোগ পাওয়া যায়নি: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (btn: { text: string; callbackData?: string; url?: string }) => {
    if (btn.url) {
      window.open(btn.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (btn.callbackData) {
      handleSendMessage(undefined, btn.callbackData);
    }
  };

  const handleClearChat = () => {
    handleSendMessage('/start');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedNotification(`"${code}" কপি করা হয়েছে`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Helper to render markdown text neatly
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div className="space-y-1 text-sm font-sans leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          let formattedLine = line
            .replace(/\*(.*?)\*/g, '<strong class="font-bold text-white">$1</strong>')
            .replace(/_(.*?)_/g, '<em class="text-slate-300 italic">$1</em>');

          // Match backticked items like `16221` and allow clicking them
          const codeMatch = formattedLine.match(/`(.*?)`/);

          if (codeMatch) {
            const rawCode = codeMatch[1];
            const replaced = formattedLine.replace(
              /`(.*?)`/g,
              `<span class="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-950 text-emerald-400 font-mono px-2 py-0.5 rounded-lg text-xs border border-slate-700/60 cursor-pointer font-semibold shadow-sm group">
                <code>$1</code>
                <span class="text-[10px] text-slate-500 group-hover:text-emerald-300">📋</span>
              </span>`
            );

            return (
              <p 
                key={idx} 
                dangerouslySetInnerHTML={{ __html: replaced }} 
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const codeEl = target.closest('span')?.querySelector('code');
                  if (codeEl && codeEl.textContent) {
                    handleCopyCode(codeEl.textContent);
                  }
                }}
                className="text-slate-200"
              />
            );
          }

          return (
            <p 
              key={idx} 
              dangerouslySetInnerHTML={{ __html: formattedLine }} 
              className="text-slate-200"
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[790px] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
      
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-3.5 h-3.5" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Telegram Chat Header */}
      <div className="px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20">
            <Bot className="w-6 h-6" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-white text-base">
                Bangladesh Banks Info Bot
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                BOT
              </span>
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              অনলাইন • স্বয়ংক্রিয় ব্যাংকিং অ্যাসিস্ট্যান্ট
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-commands-menu-top-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 px-3 rounded-xl border text-xs flex items-center gap-1.5 font-medium transition ${
              isMenuOpen 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span>কমান্ড মেনু</span>
          </button>

          <button
            id="clear-chat-simulator-btn"
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
            title="চ্যাট রিস্টার্ট করুন"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">রিসেট (/start)</span>
          </button>
        </div>
      </div>

      {/* Quick Command Pills Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 overflow-x-auto flex items-center gap-1.5 no-scrollbar z-10">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">দ্রুত এক্সেস:</span>
        <button
          onClick={() => handleSendMessage('/start')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /start
        </button>
        <button
          onClick={() => handleSendMessage('/banks')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /banks
        </button>
        <button
          onClick={() => handleSendMessage('/helpline')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /helpline
        </button>
        <button
          onClick={() => handleSendMessage('/cardblock')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /cardblock
        </button>
        <button
          onClick={() => handleSendMessage('/swift')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /swift
        </button>
        <button
          onClick={() => handleSendMessage('/routing')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /routing
        </button>
        <button
          onClick={() => handleSendMessage('/bkash')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /bkash
        </button>
        <button
          onClick={() => handleSendMessage('/timings')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /timings
        </button>
        <button
          onClick={() => handleSendMessage('/calc')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 text-xs font-mono font-medium whitespace-nowrap transition"
        >
          /calc
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none ml-10'
                  : 'bg-slate-900/95 border border-slate-800 text-slate-100 rounded-bl-none mr-10 shadow-slate-950/50'
              }`}
            >
              {/* Attached Image */}
              {msg.imageUrl && (
                <div className="mb-2.5 rounded-xl overflow-hidden border border-emerald-400/30 max-w-sm">
                  <img
                    src={msg.imageUrl}
                    alt="Uploaded banking document"
                    className="w-full h-auto max-h-60 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Message text */}
              {msg.text && renderFormattedText(msg.text)}

              {/* Telegram Inline Keyboard Buttons */}
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {msg.buttons.map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => handleButtonClick(btn)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950/40 hover:border-emerald-500/50 border border-slate-800 text-xs font-medium text-slate-200 hover:text-emerald-300 transition flex items-center justify-between gap-1 group shadow-sm active:scale-[0.98]"
                    >
                      <span className="truncate">{btn.text}</span>
                      {btn.url ? (
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                      ) : (
                        <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp & status indicator */}
              <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                msg.sender === 'user' ? 'text-emerald-200 justify-end' : 'text-slate-400 justify-start'
              }`}>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-emerald-200 inline" />}
              </div>
            </div>
          </div>
        ))}

        {/* Loading / Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-3 px-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              <span>টেলিগ্রাম বট উত্তর প্রক্রিয়া করছে...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Telegram Command Picker Drawer / Sheet */}
      {isMenuOpen && (
        <div className="absolute bottom-20 left-4 right-4 sm:left-6 sm:right-6 max-h-[380px] bg-slate-900/98 border border-slate-750 rounded-3xl p-4 shadow-2xl backdrop-blur-xl z-30 flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Menu className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">টেলিগ্রাম বট কমান্ড তালিকা</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
            {telegramCommands.map((cmd) => (
              <button
                key={cmd.cmd}
                onClick={() => handleSendMessage(cmd.cmd)}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 text-left transition group"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-emerald-500/30 shrink-0">
                  {cmd.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                      {cmd.cmd}
                    </span>
                    <span className="text-xs font-semibold text-white truncate">
                      {cmd.nameBn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {cmd.descBn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Footer */}
      <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 z-20 space-y-2.5">
        
        {/* Quick Command Pills Carousel in Inbox */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded-lg shrink-0 flex items-center gap-1">
            <Bot className="w-3 h-3" /> কমান্ড বাটন:
          </span>
          {[
            { cmd: '/start', label: '🏠 মেনু' },
            { cmd: '/banks', label: '🏛️ ব্যাংকসমূহ' },
            { cmd: '/helpline', label: '📞 হেল্পলাইন' },
            { cmd: '/cardblock', label: '💳 কার্ড ব্লক' },
            { cmd: '/weekend', label: '🛑 শুক্র-শনি ছুটি' },
            { cmd: '/routing', label: '🔢 রাউটিং' },
            { cmd: '/swift', label: '🌐 SWIFT' },
            { cmd: '/bkash', label: '📲 বিকাশ' },
            { cmd: '/islamic', label: '🕌 ইসলামিক' },
            { cmd: '/timings', label: '⏰ সময়সূচি' },
            { cmd: '/ticket', label: '🎫 টিকিট' },
            { cmd: '/calc', label: '🧮 ক্যালকুলেটর' },
            { cmd: '/complaint', label: '⚖️ অভিযোগ' },
            { cmd: '/help', label: '📖 সাহায্য' }
          ].map((item) => (
            <button
              key={item.cmd}
              type="button"
              onClick={() => handleSendMessage(item.cmd)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-600/40 text-xs whitespace-nowrap font-medium transition cursor-pointer shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Pending Image Attachment Preview */}
        {pendingImage && (
          <div className="p-2 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={pendingImage}
                alt="Upload preview"
                className="w-12 h-12 object-cover rounded-xl border border-slate-800 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-emerald-400 block truncate">ছবি প্রস্তুত করা হয়েছে 📸</span>
                <span className="text-[11px] text-slate-400 block truncate">মেসেজ লিখুন বা সরাসরি সেন্ড বাটনে চাপুন</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 hover:text-rose-300 text-slate-400 border border-slate-800 transition shrink-0"
              title="ছবি বাতিল করুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Telegram Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-3 rounded-2xl border transition flex items-center justify-center shrink-0 ${
              isMenuOpen
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="কমান্ড মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Hidden File Input & Trigger Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-2xl border transition flex items-center justify-center shrink-0 ${
              pendingImage
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-emerald-400'
            }`}
            title="ছবি বা ডকুমেন্ট আপলোড করুন"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="relative flex-1">
            <input
              id="simulator-text-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={pendingImage ? "ছবির সাথে ক্যাপশন লিখুন (ঐচ্ছিক)..." : "কমান্ড বা ব্যাংকের নাম লিখুন (যেমন: /start, /helpline, ব্র্যাক...)"}
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <button
            id="simulator-send-btn"
            type="submit"
            disabled={(!inputQuery.trim() && !pendingImage) || isLoading}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-600/20 transition flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>💡 ছবি আপলোড করলে বট স্বয়ংক্রিয় কার্ড ডিজাইন ও সহায়তা অপশন দেবে</span>
          <span className="hidden sm:inline">টেলিগ্রাম বট কমান্ড বাটন দ্বারা পরিচালিত</span>
        </div>
      </div>

    </div>
  );
};

