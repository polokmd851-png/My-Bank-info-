import React, { useState } from 'react';
import { BankInfo } from '../types';
import { Phone, Copy, Check, ExternalLink, Globe, ArrowRightLeft, ShieldCheck, Sparkles, Smartphone, Landmark } from 'lucide-react';

interface BankCardProps {
  bank: BankInfo;
  onSelect: (bank: BankInfo) => void;
  onTestInBot?: (bank: BankInfo) => void;
}

export const BankCard: React.FC<BankCardProps> = ({ bank, onSelect, onTestInBot }) => {
  const [copiedRouting, setCopiedRouting] = useState(false);
  const [copiedSwift, setCopiedSwift] = useState(false);

  const copyToClipboard = (text: string, type: 'routing' | 'swift') => {
    navigator.clipboard.writeText(text);
    if (type === 'routing') {
      setCopiedRouting(true);
      setTimeout(() => setCopiedRouting(false), 2000);
    } else {
      setCopiedSwift(true);
      setTimeout(() => setCopiedSwift(false), 2000);
    }
  };

  const getCategoryBadge = () => {
    switch (bank.category) {
      case 'state_owned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">🏛️ রাষ্ট্রায়ত্ত</span>;
      case 'islamic':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-300 border border-green-500/20">🕌 ইসলামিক শরীয়াহ</span>;
      case 'specialized':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">🌾 বিশেষায়িত</span>;
      case 'foreign':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">🌍 বিদেশি ব্যাংক</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">🏢 বেসরকারি বাণিজ্যিক</span>;
    }
  };

  return (
    <div 
      id={`bank-card-${bank.id}`}
      className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Accent bar based on bank color */}
      <div 
        className="h-1.5 w-full"
        style={{ backgroundColor: bank.color || '#10b981' }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Header: Shortcode avatar + Names */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-slate-900 shadow-md shrink-0"
                style={{ backgroundColor: bank.logoBg || '#e2e8f0', color: bank.color || '#0f172a' }}
              >
                {bank.shortCode.slice(0, 4)}
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {bank.nameBn}
                </h3>
                <p className="text-xs text-slate-400 font-sans tracking-wide">
                  {bank.nameEn}
                </p>
              </div>
            </div>

            {getCategoryBadge()}
          </div>
        </div>

        {/* Core Quick Data Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          
          {/* Helpline */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <Phone className="w-3 h-3 text-emerald-400" /> হেল্পলাইন (24/7)
            </span>
            <a 
              href={`tel:${bank.helplineShort}`}
              className="mt-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors tracking-wider"
              title="কল করতে ক্লিক করুন"
            >
              {bank.helplineShort}
            </a>
          </div>

          {/* bKash / NPSB */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <ArrowRightLeft className="w-3 h-3 text-pink-400" /> বিকাশ ট্রান্সফার
            </span>
            <div className="mt-1 font-semibold text-xs flex items-center gap-1">
              {bank.bKashTransfer.npsbTransfer ? (
                <span className="text-pink-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> NPSB ইনস্ট্যান্ট
                </span>
              ) : (
                <span className="text-slate-400">BEFTN</span>
              )}
            </div>
          </div>

          {/* Routing Number */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">রাউটিং কোড</span>
              <button 
                onClick={() => copyToClipboard(bank.routingNumber, 'routing')}
                className="text-slate-400 hover:text-white transition p-0.5"
                title="কপি করুন"
              >
                {copiedRouting ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="mt-1 font-mono font-semibold text-slate-200 text-xs tracking-wider">
              {bank.routingNumber}
            </span>
          </div>

          {/* SWIFT Code */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">SWIFT কোড</span>
              <button 
                onClick={() => copyToClipboard(bank.swiftCode, 'swift')}
                className="text-slate-400 hover:text-white transition p-0.5"
                title="কপি করুন"
              >
                {copiedSwift ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="mt-1 font-mono font-semibold text-amber-300 text-xs tracking-wider">
              {bank.swiftCode}
            </span>
          </div>

        </div>

        {/* Mobile App pill */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1 text-slate-400">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> {bank.mobileAppName}
          </span>
          <span className="text-[11px] text-slate-400">
            প্রতিষ্ঠা: {bank.establishedYear}
          </span>
        </div>

        {/* Actions Button Row */}
        <div className="flex items-center gap-2 pt-2">
          <button
            id={`btn-view-details-${bank.id}`}
            onClick={() => onSelect(bank)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-700"
          >
            বিস্তারিত তথ্য
          </button>

          {onTestInBot && (
            <button
              id={`btn-test-bot-${bank.id}`}
              onClick={() => onTestInBot(bank)}
              className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold transition flex items-center gap-1 border border-emerald-500/30"
              title="টেলিগ্রাম বটে টেস্ট করুন"
            >
              বটে দেখুন
            </button>
          )}

          <a
            href={bank.internetBankingUrl || bank.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
            title="ইন্টারনেট ব্যাংকিং পোর্টাল"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
          </a>
        </div>

      </div>
    </div>
  );
};
