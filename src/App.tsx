import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BankCard } from './components/BankCard';
import { BankModal } from './components/BankModal';
import { TelegramSimulator } from './components/TelegramSimulator';
import { BkashTransferMatrix } from './components/BkashTransferMatrix';
import { QuickLookupTools } from './components/QuickLookupTools';
import { BotSetupGuide } from './components/BotSetupGuide';
import { AdminTicketsDashboard } from './components/AdminTicketsDashboard';
import { BANGLADESH_BANKS, CATEGORY_LABELS_BN } from './data/banksData';
import { BankInfo } from './types';
import { Search, Filter, Sparkles, Landmark, Bot, PhoneCall, ShieldCheck, ArrowRightLeft, Grid, List, Check } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'directory' | 'simulator' | 'bkash' | 'tools' | 'setup' | 'tickets'>('directory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyIslamic, setOnlyIslamic] = useState(false);
  const [selectedBankForModal, setSelectedBankForModal] = useState<BankInfo | null>(null);
  const [selectedBankForBot, setSelectedBankForBot] = useState<BankInfo | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  const [serverStats, setServerStats] = useState({
    totalBanks: BANGLADESH_BANKS.length,
    uptime: 120,
    configured: false
  });

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setServerStats({
            totalBanks: data.totalBanks || BANGLADESH_BANKS.length,
            uptime: data.uptime || 0,
            configured: data.telegramConfigured || false
          });
        }
      })
      .catch(() => {});
  }, []);

  // Filter banks
  const filteredBanks = BANGLADESH_BANKS.filter(bank => {
    const matchesCategory = selectedCategory === 'all' || bank.category === selectedCategory;
    const matchesIslamic = !onlyIslamic || bank.isIslamic;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      bank.nameBn.toLowerCase().includes(q) ||
      bank.nameEn.toLowerCase().includes(q) ||
      bank.shortCode.toLowerCase().includes(q) ||
      bank.routingNumber.includes(q) ||
      bank.swiftCode.toLowerCase().includes(q) ||
      bank.helplineShort.includes(q)
    );

    return matchesCategory && matchesIslamic && matchesSearch;
  });

  const handleTestInBot = (bank: BankInfo) => {
    setSelectedBankForBot(bank);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStats}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ================= TAB 1: BANK DIRECTORY ================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            
            {/* Hero Stats & Quick Intro Banner */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Landmark className="w-3.5 h-3.5" /> বাংলাদেশ ব্যাংক তথ্যভাণ্ডার ও টেলিগ্রাম বট
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    বাংলাদেশের সকল তফসিলি ব্যাংকের পূর্ণাঙ্গ তথ্য
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    ২৪/৭ হটলাইন হেল্পলাইন, ৯ ডিজিট রাউটিং নম্বর, আন্তর্জাতিক SWIFT কোড, ইন্টারনেট ব্যাংকিং এবং বিকাশ/NPSB ফান্ড ট্রান্সফারের সম্পূর্ণ গাইড।
                  </p>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 shrink-0">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">৬১টি</span>
                    <span className="block text-[11px] text-slate-400 font-medium mt-0.5">মোট ব্যাংক</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-white">৬টি</span>
                    <span className="block text-[11px] text-slate-400 font-medium mt-0.5">রাষ্ট্রায়ত্ত</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-sky-400">৩৩টি</span>
                    <span className="block text-[11px] text-slate-400 font-medium mt-0.5">বেসরকারি</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-green-300">১০টি</span>
                    <span className="block text-[11px] text-slate-400 font-medium mt-0.5">ইসলামিক</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-purple-400">৯টি</span>
                    <span className="block text-[11px] text-slate-400 font-medium mt-0.5">বিদেশি</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-3 bg-slate-900/80 p-4 sm:p-5 rounded-3xl border border-slate-800">
              
              {/* Search Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-banks-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ব্যাংকের নাম (যেমন: ব্র্যাক, সোনালী, City Bank), শর্টকোড (IBBL, EBL), বা রাউটিং প্রিফিক্স খুঁজুন..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>

                {/* Islamic Shariah Toggle */}
                <button
                  id="toggle-islamic-filter"
                  onClick={() => setOnlyIslamic(!onlyIslamic)}
                  className={`w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition border ${
                    onlyIslamic
                      ? 'bg-green-600 text-white border-green-500 shadow-md shadow-green-600/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🕌 শুধু ইসলামিক শরীয়াহ ({BANGLADESH_BANKS.filter(b => b.isIslamic).length})</span>
                  {onlyIslamic && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar border-t border-slate-800/60">
                <span className="text-xs text-slate-400 font-medium mr-1 shrink-0">ক্যাটাগরি:</span>
                
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  সকল ({BANGLADESH_BANKS.length})
                </button>

                <button
                  onClick={() => setSelectedCategory('state_owned')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'state_owned'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  🏛️ রাষ্ট্রায়ত্ত বাণিজ্যিক ({BANGLADESH_BANKS.filter(b => b.category === 'state_owned').length})
                </button>

                <button
                  onClick={() => setSelectedCategory('private_conventional')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'private_conventional'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  🏢 বেসরকারি বাণিজ্যিক ({BANGLADESH_BANKS.filter(b => b.category === 'private_conventional').length})
                </button>

                <button
                  onClick={() => setSelectedCategory('islamic')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'islamic'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  🕌 ইসলামিক ব্যাংক ({BANGLADESH_BANKS.filter(b => b.category === 'islamic').length})
                </button>

                <button
                  onClick={() => setSelectedCategory('specialized')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'specialized'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  🌾 বিশেষায়িত উন্নয়ন ({BANGLADESH_BANKS.filter(b => b.category === 'specialized').length})
                </button>

                <button
                  onClick={() => setSelectedCategory('foreign')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'foreign'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  🌍 আন্তর্জাতিক ও বিদেশি ({BANGLADESH_BANKS.filter(b => b.category === 'foreign').length})
                </button>

              </div>

            </div>

            {/* Results Count & Bank Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  প্রদর্শিত হচ্ছে: <strong className="text-emerald-400 font-semibold">{filteredBanks.length}টি</strong> ব্যাংক
                </span>
                {searchQuery && (
                  <span>
                    সার্চ কুয়েরি: "<span className="text-white">{searchQuery}</span>"
                  </span>
                )}
              </div>

              {filteredBanks.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                  <p className="text-base text-slate-300 font-semibold">
                    কোনো ব্যাংক খুঁজে পাওয়া যায়নি!
                  </p>
                  <p className="text-xs text-slate-500">
                    অনুগ্রহ করে বানান যাচাই করুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setOnlyIslamic(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
                  >
                    সকল ফিল্টার রিসেট করুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBanks.map(bank => (
                    <BankCard
                      key={bank.id}
                      bank={bank}
                      onSelect={(b) => setSelectedBankForModal(b)}
                      onTestInBot={handleTestInBot}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 2: TELEGRAM BOT SIMULATOR ================= */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <TelegramSimulator initialBank={selectedBankForBot} />
          </div>
        )}

        {/* ================= TAB 3: BKASH & NPSB TRANSFER MATRIX ================= */}
        {activeTab === 'bkash' && (
          <BkashTransferMatrix
            onSelectBank={(b) => setSelectedBankForModal(b)}
          />
        )}

        {/* ================= TAB 4: QUICK LOOKUP TOOLS ================= */}
        {activeTab === 'tools' && (
          <QuickLookupTools
            onSelectBank={(b) => setSelectedBankForModal(b)}
          />
        )}

        {/* ================= TAB 5: BOT SETUP & WEBHOOK GUIDE ================= */}
        {activeTab === 'setup' && (
          <BotSetupGuide />
        )}

        {/* ================= TAB 6: SUPPORT TICKETS DASHBOARD ================= */}
        {activeTab === 'tickets' && (
          <AdminTicketsDashboard />
        )}


      </main>

      {/* Full Bank Details Modal */}
      <BankModal
        bank={selectedBankForModal}
        onClose={() => setSelectedBankForModal(null)}
        onTestInBot={handleTestInBot}
      />

    </div>
  );
}
export default App;
