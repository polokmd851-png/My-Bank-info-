import React, { useState } from 'react';
import { BANGLADESH_BANKS } from '../data/banksData';
import { BankInfo } from '../types';
import { Phone, Copy, Check, Search, Globe, Hash, ShieldCheck, ArrowRight } from 'lucide-react';

interface QuickLookupToolsProps {
  onSelectBank: (bank: BankInfo) => void;
}

export const QuickLookupTools: React.FC<QuickLookupToolsProps> = ({ onSelectBank }) => {
  const [activeTool, setActiveTool] = useState<'helpline' | 'routing' | 'swift'>('helpline');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredBanks = BANGLADESH_BANKS.filter(b => 
    b.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.routingNumber.includes(searchQuery) ||
    b.swiftCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.helplineShort.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Tool Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTool('helpline')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTool === 'helpline'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">২৪/৭ হেল্পলাইন হটলাইন</h3>
              <p className="text-xs text-slate-400">জরুরি কার্ড ব্লক ও সাপোর্ট নম্বর</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('routing')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTool === 'routing'
              ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/20'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">রাউটিং নম্বর ফাইন্ডার</h3>
              <p className="text-xs text-slate-400">BEFTN, NPSB ও RTGS ৯ ডিজিট কোড</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('swift')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTool === 'swift'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/20'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">SWIFT / BIC কোড</h3>
              <p className="text-xs text-slate-400">আন্তর্জাতিক রেমিট্যান্স কোড</p>
            </div>
          </div>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ব্যাংকের নাম, কোড বা নম্বর দিয়ে ফিল্টার করুন..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Grid of Results according to active tool */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBanks.map((bank) => {
          const routingKey = `routing-${bank.id}`;
          const swiftKey = `swift-${bank.id}`;
          const phoneKey = `phone-${bank.id}`;

          return (
            <div
              key={bank.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                    style={{ backgroundColor: bank.logoBg || '#e2e8f0', color: bank.color || '#0f172a' }}
                  >
                    {bank.shortCode.slice(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{bank.nameBn}</h4>
                    <p className="text-[11px] text-slate-400">{bank.nameEn} ({bank.shortCode})</p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectBank(bank)}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                  title="বিস্তারিত"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Tool Specific Value Display */}
              {activeTool === 'helpline' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">২৪/৭ হটলাইন</span>
                    <a 
                      href={`tel:${bank.helplineShort}`}
                      className="text-base font-bold text-emerald-400 hover:text-emerald-300 transition tracking-wider"
                    >
                      {bank.helplineShort}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bank.helpline, phoneKey)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                    title="সম্পূর্ণ নম্বর কপি করুন"
                  >
                    {copiedKey === phoneKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {activeTool === 'routing' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">হেড অফিস রাউটিং (Pre: {bank.routingPrefix})</span>
                    <span className="text-sm font-mono font-bold text-purple-300 tracking-wider">
                      {bank.routingNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bank.routingNumber, routingKey)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                    title="রাউটিং কপি করুন"
                  >
                    {copiedKey === routingKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {activeTool === 'swift' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">SWIFT / BIC Code</span>
                    <span className="text-sm font-mono font-bold text-amber-300 tracking-wider">
                      {bank.swiftCode}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bank.swiftCode, swiftKey)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                    title="SWIFT কপি করুন"
                  >
                    {copiedKey === swiftKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
