import React from 'react';
import { Bot, Landmark, Send, ArrowRightLeft, Settings, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';

interface NavbarProps {
  activeTab: 'directory' | 'simulator' | 'bkash' | 'tools' | 'setup' | 'tickets';
  setActiveTab: (tab: 'directory' | 'simulator' | 'bkash' | 'tools' | 'setup' | 'tickets') => void;
  serverStatus: {
    totalBanks: number;
    uptime: number;
    configured: boolean;
  };
}


export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, serverStatus }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  বাংলাদেশ ব্যাংক টেলিগ্রাম বট
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Bot className="w-3 h-3 mr-1" /> Bot Server Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                সকল তফসিলি ব্যাংক • হেল্পলাইন • রাউটিং • সুইফট • বিকাশ/NPSB ট্রান্সফার
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              id="nav-tab-directory"
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'directory'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Landmark className="w-4 h-4" />
              ব্যাংক ডিরেক্টরি ({serverStatus.totalBanks})
            </button>

            <button
              id="nav-tab-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Send className="w-4 h-4 text-cyan-400" />
              টেলিগ্রাম বট সিমুলেটর
            </button>

            <button
              id="nav-tab-bkash"
              onClick={() => setActiveTab('bkash')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'bkash'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-pink-400" />
              বিকাশ / NPSB ম্যাট্রিক্স
            </button>

            <button
              id="nav-tab-tools"
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tools'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              টুলস ও হেল্পলাইন
            </button>

            <button
              id="nav-tab-setup"
              onClick={() => setActiveTab('setup')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'setup'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              বট সেটআপ
            </button>

            <button
              id="nav-tab-tickets"
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tickets'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              টিকেট ইনবক্স
            </button>
          </nav>


          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            <button
              id="quick-open-simulator-btn"
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">বট টেস্ট করুন</span>
              <span className="sm:hidden">বট</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'directory' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏛️ সকল ব্যাংক
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'simulator' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            💬 বট চ্যাট
          </button>
          <button
            onClick={() => setActiveTab('bkash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'bkash' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📲 বিকাশ ট্রান্সফার
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'tools' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📞 হেল্পলাইন
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'setup' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚙️ সেটআপ
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'tickets' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🛡️ টিকেট
          </button>

        </div>

      </div>
    </header>
  );
};
