import React, { useState } from 'react';
import { BankInfo } from '../types';
import { CATEGORY_LABELS_BN } from '../data/banksData';
import { X, Phone, Globe, Smartphone, Copy, Check, MapPin, Mail, ArrowRightLeft, ShieldCheck, HelpCircle, ExternalLink, Calendar } from 'lucide-react';

interface BankModalProps {
  bank: BankInfo | null;
  onClose: () => void;
  onTestInBot?: (bank: BankInfo) => void;
}

export const BankModal: React.FC<BankModalProps> = ({ bank, onClose, onTestInBot }) => {
  const [copiedRouting, setCopiedRouting] = useState(false);
  const [copiedSwift, setCopiedSwift] = useState(false);

  if (!bank) return null;

  const copyText = (text: string, type: 'routing' | 'swift') => {
    navigator.clipboard.writeText(text);
    if (type === 'routing') {
      setCopiedRouting(true);
      setTimeout(() => setCopiedRouting(false), 2000);
    } else {
      setCopiedSwift(true);
      setTimeout(() => setCopiedSwift(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="bank-details-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 text-slate-100"
      >
        {/* Top Header Banner */}
        <div 
          className="p-6 relative overflow-hidden"
          style={{ backgroundColor: bank.color ? `${bank.color}22` : '#064e3b' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border border-white/10 shrink-0"
                style={{ backgroundColor: bank.logoBg || '#f1f5f9', color: bank.color || '#0f172a' }}
              >
                {bank.shortCode}
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                  {CATEGORY_LABELS_BN[bank.category]}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {bank.nameBn}
                </h2>
                <p className="text-sm text-slate-300 font-sans font-medium">
                  {bank.nameEn}
                </p>
              </div>
            </div>

            <button
              id="close-bank-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Helpline */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> ২৪/৭ হেল্পলাইন হটলাইন
                </span>
                <a 
                  href={`tel:${bank.helplineShort}`}
                  className="mt-1 block text-base font-bold text-emerald-400 hover:underline"
                >
                  {bank.helpline}
                </a>
                {bank.cardHotline && (
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    কার্ড জরুরি হটলাইন: {bank.cardHotline}
                  </span>
                )}
              </div>
            </div>

            {/* Routing Number */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">রাউটিং নম্বর (হেড অফিস)</span>
                <p className="mt-1 text-base font-mono font-bold text-slate-100 tracking-wider">
                  {bank.routingNumber}
                </p>
                <span className="text-xs text-slate-400">
                  রাউটিং প্রিফিক্স: {bank.routingPrefix}
                </span>
              </div>
              <button
                onClick={() => copyText(bank.routingNumber, 'routing')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
              >
                {copiedRouting ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* SWIFT / BIC */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">SWIFT / BIC কোড (রেমিট্যান্স)</span>
                <p className="mt-1 text-base font-mono font-bold text-amber-300 tracking-wider">
                  {bank.swiftCode}
                </p>
                <span className="text-xs text-slate-400">
                  বৈদেশিক মুদ্রা ও ব্যাংক ট্রান্সফার
                </span>
              </div>
              <button
                onClick={() => copyText(bank.swiftCode, 'swift')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
              >
                {copiedSwift ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Establishment & Network */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> প্রতিষ্ঠান ও নেটওয়ার্ক
              </span>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                প্রতিষ্ঠিত: {bank.establishedYear} সাল
              </p>
              <span className="text-xs text-slate-400">
                শাখা: {bank.branchesCount ? `${bank.branchesCount}+` : 'সারাদেশে'} | এটিএম: {bank.atmsCount ? `${bank.atmsCount}+` : 'উপলব্ধ'}
              </span>
            </div>

          </div>

          {/* bKash & MFS Compatibility Box */}
          <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-900/40 space-y-2">
            <h4 className="text-sm font-bold text-pink-400 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" /> বিকাশ ও এনপিএসবি (NPSB) ট্রান্সফার সংক্রান্ত তথ্য
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>NPSB ব্যাংক ট্রান্সফার: <strong>{bank.bKashTransfer.npsbTransfer ? 'সক্রিয় (২৪/৭ ইনস্ট্যান্ট)' : 'সীমিত'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>বিকাশ অ্যাড মানি: <strong>{bank.bKashTransfer.bkashAddMoney ? 'সক্রিয়' : 'প্রযোজ্য নয়'}</strong></span>
              </div>
            </div>
            <p className="text-xs text-pink-300/80 italic pt-1">
              {bank.bKashTransfer.chargeNoteBn}
            </p>
          </div>

          {/* Digital Banking & Web portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" /> ডিজিটাল ব্যাংকিং ও অনলাইন লিংক
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">অফিসিয়াল মোবাইল অ্যাপ:</span>
                <span className="font-bold text-white text-sm">{bank.mobileAppName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-1">ইন্টারনেট ব্যাংকিং পোর্টাল:</span>
                  <a 
                    href={bank.internetBankingUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    লগইন করুন <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Head Office and Contact */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">প্রধান কার্যালয়ের ঠিকানা:</strong>
                <p className="text-slate-300">{bank.headOffice}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-400">ইমেইল:</span>
              <a href={`mailto:${bank.email}`} className="text-slate-200 hover:underline">{bank.email}</a>
            </div>
          </div>

          {/* Features / Highlights */}
          {bank.featuresBn && bank.featuresBn.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-2">ব্যাংকের বিশেষ সেবাসমূহ</h4>
              <div className="flex flex-wrap gap-2">
                {bank.featuresBn.map((feature, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 rounded-xl bg-slate-800/90 text-slate-300 text-xs border border-slate-700/60"
                  >
                    ✨ {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* FAQs if present */}
          {bank.faq && bank.faq.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" /> প্রায়শই জিজ্ঞাসিত প্রশ্ন (FAQ)
              </h4>
              <div className="space-y-2">
                {bank.faq.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                    <p className="font-semibold text-emerald-300 mb-1">প্রশ্ন: {item.qBn}</p>
                    <p className="text-slate-300">{item.aBn}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            টেলিগ্রাম বটে দেখতে: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">/search {bank.shortCode}</code>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onTestInBot && (
              <button
                onClick={() => {
                  onClose();
                  onTestInBot(bank);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                টেলিগ্রাম বট চ্যাটে দেখুন
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
