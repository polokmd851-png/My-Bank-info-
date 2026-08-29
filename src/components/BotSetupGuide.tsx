import React, { useState, useEffect } from 'react';
import { Bot, Copy, Check, ExternalLink, Terminal, ShieldCheck, RefreshCw, AlertCircle, Sparkles, Zap, Unlink, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export const BotSetupGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [appUrlInput, setAppUrlInput] = useState('');
  const [botTokenInput, setBotTokenInput] = useState('');
  const [connectionMessage, setConnectionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
    if (window.location.origin) {
      setAppUrlInput(window.location.origin);
    }
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setStatusData(data);
    } catch (e) {
      console.warn('Status fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnectBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botTokenInput.trim()) {
      setConnectionMessage({ type: 'error', text: 'অনুগ্রহ করে BotFather থেকে পাওয়া টোকেনটি প্রবেশ করান।' });
      return;
    }

    setConnecting(true);
    setConnectionMessage(null);

    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botTokenInput.trim() })
      });
      const data = await res.json();

      if (data.ok) {
        setConnectionMessage({ type: 'success', text: data.message });
        setBotTokenInput('');
        fetchStatus();
      } else {
        setConnectionMessage({ type: 'error', text: data.error || 'টোকেন সংযোগে ত্রুটি ঘটেছে।' });
      }
    } catch (err: any) {
      setConnectionMessage({ type: 'error', text: err.message || 'সার্ভারে সংযোগ করা সম্ভব হয়নি।' });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectBot = async () => {
    setDisconnecting(true);
    try {
      await fetch('/api/telegram/disconnect', { method: 'POST' });
      fetchStatus();
      setConnectionMessage(null);
    } catch (e) {
      console.warn('Disconnect error:', e);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSetWebhook = async () => {
    setLoading(true);
    setWebhookResult(null);
    try {
      const res = await fetch('/api/telegram/set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appUrl: appUrlInput || window.location.origin,
          token: botTokenInput || undefined
        })
      });
      const data = await res.json();
      setWebhookResult(data);
      fetchStatus();
    } catch (e: any) {
      setWebhookResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const commandsList = `start - মূল মেনু ও দ্রুত অ্যাকশন বাটন
banks - ক্যাটাগরি ভিত্তিক সকল ৬১টি তফসিলি ব্যাংক
search - ব্যাংক বা শর্টকোড দিয়ে অনুসন্ধান
helpline - ২৪/৭ কল সেন্টার ও হেল্পলাইন হটলাইন
cardblock - জরুরি কার্ড ব্লক হটলাইন নম্বর
swift - আন্তর্জাতিক রেমিট্যান্সের SWIFT কোড
routing - বিএফটিএন ও এনপিএসবি রাউটিং কোড
bkash - বিকাশ ও এনপিএসবি ব্যাংক ট্রান্সফার
islamic - ১০টি পূর্ণাঙ্গ ইসলামিক শরীয়াহ ব্যাংক
govt - সরকারি রাষ্ট্রায়ত্ত ও বিশেষায়িত ব্যাংক
foreign - আন্তর্জাতিক বিদেশি ব্যাংকসমূহ
timings - বিএফটিএন, এনপিএসবি ও আরটিজিএস সময়সূচি
complaint - বাংলাদেশ ব্যাংক গ্রাহক স্বার্থ সেল (16236)
calc - মাসিক লোন কিস্তি ও ডিপিএস ক্যালকুলেটর
help - বট ব্যবহারের নিয়মাবলী ও সহায়িকা`;

  const webhookEndpoint = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/telegram-webhook`;

  const isConnected = statusData?.configured && statusData?.bot;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Live Telegram Bot Connection Box (TOP PRIORITY) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  টেলিগ্রাম বট লাইভ কানেক্টর
                </h2>
                {isConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    সক্রিয় (Active)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    টোকেন প্রয়োজন
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                আপনার তৈরি করা টেলিগ্রাম বটের টোকেন দিয়ে সরাসরি এই সার্ভারের সাথে সংযুক্ত করুন
              </p>
            </div>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition self-end sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            স্ট্যাটাস চেক
          </button>
        </div>

        {/* Status display if Connected */}
        {isConnected ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {statusData.bot.first_name}
                    </span>
                    <span className="font-mono text-xs text-emerald-400 font-semibold">
                      @{statusData.bot.username}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ✅ সার্ভার সফলভাবে লাইভ টেলিগ্রাম বটের সাথে যুক্ত রয়েছে! এখন টেলিগ্রামে মেসেজ পাঠালে সাথে সাথে উত্তর পাবেন।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://t.me/${statusData.bot.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  টেলিগ্রামে বট খুলুন
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleDisconnectBot}
                  disabled={disconnecting}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:border-rose-500/40 border border-slate-700 text-slate-400 hover:text-rose-300 transition"
                  title="সংযোগ বিচ্ছিন্ন করুন"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Token Input Form */
          <form onSubmit={handleConnectBot} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                টেলিগ্রাম বট টোকেন (Telegram Bot Token):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={botTokenInput}
                  onChange={(e) => setBotTokenInput(e.target.value)}
                  placeholder="যেমন: 7891234567:AAHxyzABCdefGhIJKlmNoPQ..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition shadow-inner"
                  disabled={connecting}
                />
                <button
                  type="submit"
                  disabled={connecting || !botTokenInput.trim()}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      কানেক্ট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      বটের সাথে সরাসরি কানেক্ট করুন
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                💡 টেলিগ্রামে <strong>@BotFather</strong> এ <code className="bg-slate-950 text-emerald-400 px-1 py-0.5 rounded">/newbot</code> বা <code className="bg-slate-950 text-emerald-400 px-1 py-0.5 rounded">/mybots</code> লিখে API Token সংগ্রহ করুন।
              </p>
            </div>

            {connectionMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                  connectionMessage.type === 'success'
                    ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
                }`}
              >
                {connectionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{connectionMessage.text}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Step 1: Create Bot in BotFather */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
            ১
          </span>
          <h3 className="text-base font-bold text-white">
            BotFather থেকে কীভাবে টোকেন সংগ্রহ করবেন?
          </h3>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-300 pl-2 leading-relaxed">
          <li>টেলিগ্রামে <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-3 h-3" /></a> ওপেন করুন।</li>
          <li>আপনার তৈরি করা বট থাকলে কমান্ড দিন: <code className="bg-slate-950 text-emerald-300 px-2 py-0.5 rounded font-mono">/mybots</code> এবং আপনার বট (যেমন <strong>@Myimopage</strong>) সিলেক্ট করুন &gt; <strong>API Token</strong> চাপুন।</li>
          <li>নতুন বট তৈরি করতে চাইলে কমান্ড দিন: <code className="bg-slate-950 text-emerald-300 px-2 py-0.5 rounded font-mono">/newbot</code></li>
          <li>বটফাদারের দেওয়া <code className="bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">123456:ABC...</code> টোকেনটি কপি করে উপরের <strong>টেলিগ্রাম বট লাইভ কানেক্টর</strong> বক্সে পেস্ট করে <strong>কানেক্ট</strong> চাপুন।</li>
        </ol>
      </div>

      {/* Step 2: Setup Commands in BotFather */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm">
              ২
            </span>
            <h3 className="text-base font-bold text-white">
              বটের মেনু বাটনে কমান্ড যুক্ত করা (/setcommands)
            </h3>
          </div>
          <button
            onClick={() => copyText(commandsList, 'commands')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copiedKey === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            কমান্ড কপি করুন
          </button>
        </div>

        <p className="text-xs text-slate-400">
          আপনার টেলিগ্রাম অ্যাপের বাম পাশের <strong>[≡ Menu]</strong> বাটনে এক ক্লিকে সকল অপশন দেখতে BotFather এ <code className="bg-slate-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono">/setcommands</code> দিন &gt; আপনার বটটি বেছে নিন &gt; নিচের টেক্সটটি পেস্ট করে সেন্ড করুন:
        </p>

        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
          {commandsList}
        </pre>
      </div>

      {/* Step 3: Webhook Option (Optional) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm">
            ৩
          </span>
          <h3 className="text-base font-bold text-white">
            ওয়েবহুক (Webhook) সংযোগ (ঐচ্ছিক)
          </h3>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              আপনার সার্ভার Webhook URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookEndpoint}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200"
              />
              <button
                onClick={() => copyText(webhookEndpoint, 'webhook')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="URL কপি করুন"
              >
                {copiedKey === 'webhook' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" /> Webhook সেট করার টুল:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">টেলিগ্রাম বট টোকেন:</label>
                <input
                  type="text"
                  value={botTokenInput}
                  onChange={(e) => setBotTokenInput(e.target.value)}
                  placeholder="123456789:ABCdefGhIJKlmNoPQ..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">অ্যাপ URL:</label>
                <input
                  type="text"
                  value={appUrlInput}
                  onChange={(e) => setAppUrlInput(e.target.value)}
                  placeholder="https://your-app-domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSetWebhook}
              disabled={loading || !botTokenInput}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              টেলিগ্রামে Webhook রেজিস্টার করুন
            </button>

            {webhookResult && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="font-semibold text-emerald-400 block mb-1">Webhook রেসপন্স:</span>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(webhookResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

