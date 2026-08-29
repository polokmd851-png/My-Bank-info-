import React, { useState } from 'react';
import { BANGLADESH_BANKS } from '../data/banksData';
import { BankInfo } from '../types';
import { ArrowRightLeft, Check, X, Search, ShieldCheck, Zap, Smartphone, ExternalLink, HelpCircle } from 'lucide-react';

interface BkashTransferMatrixProps {
  onSelectBank: (bank: BankInfo) => void;
}

export const BkashTransferMatrix: React.FC<BkashTransferMatrixProps> = ({ onSelectBank }) => {
  const [filterType, setFilterType] = useState<'all' | 'npsb' | 'add_money'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBanks = BANGLADESH_BANKS.filter((b) => {
    const matchesSearch = 
      b.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shortCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'npsb') {
      return b.bKashTransfer.npsbTransfer;
    }
    if (filterType === 'add_money') {
      return b.bKashTransfer.bkashAddMoney;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Explainer Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-slate-900 border border-pink-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              <ArrowRightLeft className="w-3.5 h-3.5" /> bKash & NPSB Interoperable Banking
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              বিকাশ ও ব্যাংক ট্রান্সফার তথ্য ম্যাট্রিক্স
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              বাংলাদেশ ব্যাংকের National Payment Switch Bangladesh (NPSB) এবং MFS নেটওয়ার্কের মাধ্যমে বিকাশ থেকে ব্যাংক এবং ব্যাংক থেকে বিকাশে ইনস্ট্যান্ট টাকা লেনদেনের পূর্ণাঙ্গ তালিকা।
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-pink-900/40 text-center min-w-[120px]">
              <span className="text-2xl font-black text-pink-400">
                {BANGLADESH_BANKS.filter(b => b.bKashTransfer.npsbTransfer).length}
              </span>
              <span className="block text-xs text-slate-400 font-medium mt-0.5">NPSB ইনস্ট্যান্ট ব্যাংক</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-pink-900/40 text-center min-w-[120px]">
              <span className="text-2xl font-black text-emerald-400">
                {BANGLADESH_BANKS.filter(b => b.bKashTransfer.bkashAddMoney).length}
              </span>
              <span className="block text-xs text-slate-400 font-medium mt-0.5">অ্যাড মানি সমর্থিত</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === 'all'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            সকল ব্যাংক ({BANGLADESH_BANKS.length})
          </button>
          <button
            onClick={() => setFilterType('npsb')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              filterType === 'npsb'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> NPSB ট্রান্সফার ({BANGLADESH_BANKS.filter(b => b.bKashTransfer.npsbTransfer).length})
          </button>
          <button
            onClick={() => setFilterType('add_money')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === 'add_money'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            অ্যাড মানি সাপোর্ট ({BANGLADESH_BANKS.filter(b => b.bKashTransfer.bkashAddMoney).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ব্যাংক বা শর্টকোড খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
          />
        </div>

      </div>

      {/* Table / List View */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 pl-6">ব্যাংকের নাম ও কোড</th>
                <th className="p-4">NPSB ট্রান্সফার (Bank to bKash)</th>
                <th className="p-4">বিকাশ টু ব্যাংক (NPSB)</th>
                <th className="p-4">ইন্টারনেট ব্যাংকিং অ্যাপ</th>
                <th className="p-4">চার্জ ও লেনদেনের গতি</th>
                <th className="p-4 pr-6 text-right">বিস্তারিত</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBanks.map((bank) => (
                <tr key={bank.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ backgroundColor: bank.logoBg || '#e2e8f0', color: bank.color || '#0f172a' }}
                      >
                        {bank.shortCode.slice(0, 3)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{bank.nameBn}</span>
                        <span className="text-[11px] text-slate-400">{bank.nameEn} ({bank.shortCode})</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    {bank.bKashTransfer.bkashAddMoney ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <Check className="w-3 h-3 text-emerald-400" /> ইনস্ট্যান্ট সমর্থিত
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                        <X className="w-3 h-3 text-slate-600" /> প্রযোজ্য নয়
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {bank.bKashTransfer.npsbTransfer ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-pink-500/10 text-pink-300 border border-pink-500/20">
                        <Zap className="w-3 h-3 text-pink-400" /> ২৪/৭ সরাসরি
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        BEFTN (পরের কার্যদিবস)
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{bank.mobileAppName}</span>
                    </div>
                  </td>

                  <td className="p-4 max-w-xs">
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      {bank.bKashTransfer.chargeNoteBn}
                    </span>
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => onSelectBank(bank)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                    >
                      দেখুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
