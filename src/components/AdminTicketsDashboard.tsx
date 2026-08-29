import React, { useState, useEffect } from 'react';
import { SupportTicket, TicketStatus } from '../types';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  FileText, 
  User, 
  Phone, 
  Send, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Inbox
} from 'lucide-react';

export const AdminTicketsDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [agentNoteInput, setAgentNoteInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (data.tickets && data.tickets.length > 0 && !selectedTicket) {
          setSelectedTicket(data.tickets[0]);
          setAgentNoteInput(data.tickets[0].agentNotes || '');
        }
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          agentNotes: agentNoteInput
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setSelectedTicket(updated);
      }
    } catch (e) {
      console.error('Failed to update ticket:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedTicket) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentNotes: agentNoteInput
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setSelectedTicket(updated);
      }
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      t.id.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      (t.userContact && t.userContact.toLowerCase().includes(q)) ||
      t.summary.toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const inReviewCount = tickets.filter(t => t.status === 'in_review').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> অ্যাডমিন হেল্পডেস্ক পোর্টাল
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              সাপোর্ট টিকিট ও প্রতিনিধি ইনবক্স
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              বট থেকে গ্রাহকদের পাঠানো ডকুমেন্ট, তথ্য যাচাই ও যোগাযোগের অনুরোধসমূহ ইন্টারনাল প্রসেসিং করুন।
            </p>
          </div>

          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            রিফ্রেশ ইনবক্স
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block">মোট টিকিট</span>
            <span className="text-xl font-bold text-white">{tickets.length}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40">
            <span className="text-xs text-amber-300/80 block">🕒 অপেক্ষমাণ (Pending)</span>
            <span className="text-xl font-bold text-amber-400">{pendingCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-800/40">
            <span className="text-xs text-sky-300/80 block">⏳ রিভিউ চলছে (In Review)</span>
            <span className="text-xl font-bold text-sky-400">{inReviewCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
            <span className="text-xs text-emerald-300/80 block">✅ সমাধান সম্পন্ন (Resolved)</span>
            <span className="text-xl font-bold text-emerald-400">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Ticket Layout: Left List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filter & Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Filter Bar */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="টিকিট আইডি, নাম বা ফোন দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {[
                { id: 'all', label: 'সকল' },
                { id: 'pending', label: '🕒 অপেক্ষমাণ' },
                { id: 'in_review', label: '⏳ রিভিউ' },
                { id: 'resolved', label: '✅ সম্পন্ন' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Items List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">কোনো সাপোর্ট টিকিট পাওয়া যায়নি।</p>
              </div>
            ) : (
              filteredTickets.map(tkt => {
                const isSelected = selectedTicket?.id === tkt.id;
                const statusBadge = 
                  tkt.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  tkt.status === 'in_review' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/30';

                return (
                  <div
                    key={tkt.id}
                    onClick={() => {
                      setSelectedTicket(tkt);
                      setAgentNoteInput(tkt.agentNotes || '');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {tkt.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                        {tkt.status === 'resolved' ? 'সম্পন্ন' : tkt.status === 'in_review' ? 'রিভিউ চলছে' : 'অপেক্ষমাণ'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {tkt.summary}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" /> {tkt.userName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(tkt.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Selected Ticket Details & Response Actions */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-indigo-400">
                      {selectedTicket.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      selectedTicket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      selectedTicket.status === 'in_review' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {selectedTicket.status === 'resolved' ? '✅ সমাধান সম্পন্ন' :
                       selectedTicket.status === 'in_review' ? '⏳ পর্যালোচনাধীন' :
                       '🕒 অপেক্ষমাণ'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    তৈরি: {new Date(selectedTicket.createdAt).toLocaleString('bn-BD')}
                  </p>
                </div>

                {/* Status Change Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'in_review')}
                    disabled={isUpdating || selectedTicket.status === 'in_review'}
                    className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-semibold border border-sky-800/60 disabled:opacity-40 transition cursor-pointer"
                  >
                    রিভিউতে নিন
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                    disabled={isUpdating || selectedTicket.status === 'resolved'}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800/60 disabled:opacity-40 transition cursor-pointer"
                  >
                    সম্পন্ন মার্ক করুন
                  </button>
                </div>
              </div>

              {/* Customer Info Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">গ্রাহকের নাম:</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> {selectedTicket.userName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">যোগাযোগের বিবরণ:</span>
                  <span className="text-slate-200 font-mono font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {selectedTicket.userContact || 'প্রদান করা হয়নি'}
                  </span>
                </div>
              </div>

              {/* Inquiry Summary & Uploaded Document */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  অনুসন্ধানের বিষয়বস্তু
                </h5>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                  {selectedTicket.summary}
                </div>

                {selectedTicket.imageUrl && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400">গ্রাহকের আপলোডকৃত ডকুমেন্ট:</span>
                    <div className="max-w-md rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={selectedTicket.imageUrl}
                        alt="Customer Document"
                        className="w-full h-auto max-h-72 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Representative Response & Internal Notes */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    প্রতিনিধির নোট ও গ্রাহক ফিডব্যাক
                  </h5>
                  <span className="text-[11px] text-slate-500">গ্রাহক /status দিয়ে এই নোট দেখতে পাবেন</span>
                </div>

                <textarea
                  rows={3}
                  value={agentNoteInput}
                  onChange={(e) => setAgentNoteInput(e.target.value)}
                  placeholder="এখানে নোট লিখুন (যেমন: রাউটিং নম্বর যাচাই সম্পন্ন হয়েছে, গ্রাহকের সাথে কথা বলা হয়েছে)..."
                  className="w-full p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isUpdating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    নোট সংরক্ষণ ও গ্রাহককে আপডেট দিন
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
              <FileText className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">বাম পাশের তালিকা থেকে একটি টিকিট নির্বাচন করুন</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
