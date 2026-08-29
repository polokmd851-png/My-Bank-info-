import { BANGLADESH_BANKS, CATEGORY_LABELS_BN } from '../src/data/banksData';
import { BankInfo } from '../src/types';
import { GoogleGenAI } from '@google/genai';

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramReplyMarkup {
  inline_keyboard?: TelegramInlineButton[][];
}

export interface TelegramBotResponse {
  text: string;
  reply_markup?: TelegramReplyMarkup;
  parse_mode?: 'Markdown' | 'HTML';
  ticketCreated?: any;
}

// In-memory support ticket store
export interface InternalTicket {
  id: string;
  userName: string;
  userContact?: string;
  type: 'document_verification' | 'general_inquiry' | 'card_assistance';
  summary: string;
  imageUrl?: string;
  status: 'pending' | 'in_review' | 'resolved';
  createdAt: string;
  updatedAt: string;
  agentNotes?: string;
}

export const SUPPORT_TICKETS_STORE: InternalTicket[] = [
  {
    id: 'TKT-8941',
    userName: 'আহমেদ হাসান (Ahmed)',
    userContact: '01712-345678',
    type: 'document_verification',
    summary: 'চেকবই ও রাউটিং নম্বর যাচাইকরণ অনুসন্ধান',
    status: 'in_review',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    agentNotes: 'সোনালী ব্যাংক হেড অফিস রাউটিং নম্বর নিশ্চিত করা হয়েছে।'
  },
  {
    id: 'TKT-8935',
    userName: 'তানভীর আহমেদ',
    userContact: 'tanvir.bank@example.com',
    type: 'card_assistance',
    summary: 'ইন্টারনেট ব্যাংকিং এনপিএসবি ট্রান্সফার লিমিট অনুসন্ধান',
    status: 'resolved',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    agentNotes: 'দৈনিক লেনদেন সীমা এবং চার্জ তালিকা বুঝিয়ে দেওয়া হয়েছে।'
  }
];

export function createSupportTicket(data: {
  userName?: string;
  userContact?: string;
  type: 'document_verification' | 'general_inquiry' | 'card_assistance';
  summary: string;
  imageUrl?: string;
}): InternalTicket {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `TKT-${randomNum}`;
  const now = new Date().toISOString();

  const newTicket: InternalTicket = {
    id: ticketId,
    userName: data.userName || 'টেলিগ্রাম গ্রাহক',
    userContact: data.userContact,
    type: data.type,
    summary: data.summary,
    imageUrl: data.imageUrl,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  SUPPORT_TICKETS_STORE.unshift(newTicket);
  return newTicket;
}


// Initialize Gemini client for natural query assistance
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Gemini client init error:', e);
    }
  }
  return geminiClient;
}

/**
 * Format a single bank's detailed overview into markdown for Telegram
 */
export function formatBankDetailsTelegram(bank: BankInfo): TelegramBotResponse {
  const isBkashSupported = bank.bKashTransfer.npsbTransfer || bank.bKashTransfer.bkashAddMoney;
  
  let msg = `🏛 *${bank.nameBn}*\n`;
  msg += `🇬🇧 *${bank.nameEn}* (${bank.shortCode})\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📌 *ধরন:* ${CATEGORY_LABELS_BN[bank.category] || bank.category} ${bank.isIslamic ? '🕌 (পূর্ণাঙ্গ ইসলামী শরীয়াহ)' : ''}\n`;
  msg += `📅 *প্রতিষ্ঠিত:* ${bank.establishedYear} সাল\n`;
  msg += `📞 *২৪/৭ কল সেন্টার:* \`${bank.helpline}\`\n`;
  if (bank.cardHotline && bank.cardHotline !== bank.helplineShort) {
    msg += `💳 *জরুরি কার্ড সাপোর্ট:* \`${bank.cardHotline}\`\n`;
  }
  msg += `🔢 *হেড অফিস রাউটিং নম্বর:* \`${bank.routingNumber}\` (Pre: \`${bank.routingPrefix}\`)\n`;
  msg += `🌐 *SWIFT / BIC কোড:* \`${bank.swiftCode}\`\n`;
  msg += `🏢 *প্রধান কার্যালয়:* ${bank.headOffice}\n`;
  msg += `📧 *ইমেইল:* \`${bank.email}\`\n\n`;

  msg += `📲 *ডিজিটাল ব্যাংকিং সেবা:*\n`;
  msg += `• অ্যাপ: *${bank.mobileAppName}*\n`;
  msg += `• ব্রাঞ্চ সংখ্যা: ~${bank.branchesCount}টি | এটিএম: ~${bank.atmsCount}টি\n\n`;

  msg += `⚡ *বিকাশ ও এনপিএসবি ট্রান্সফার:*\n`;
  msg += `• NPSB ট্রান্সফার: ${bank.bKashTransfer.npsbTransfer ? '✅ সমর্থিত (Instant)' : '❌ তথ্য নেই'}\n`;
  msg += `• বিকাশ অ্যাড মানি: ${bank.bKashTransfer.bkashAddMoney ? '✅ সমর্থিত' : '❌ তথ্য নেই'}\n`;
  msg += `• নোট: _${bank.bKashTransfer.chargeNoteBn}_\n\n`;

  if (bank.featuresBn && bank.featuresBn.length > 0) {
    msg += `✨ *প্রধান সেবাসমূহ:*\n`;
    bank.featuresBn.forEach(f => {
      msg += `▫️ ${f}\n`;
    });
    msg += `\n`;
  }

  const buttons: TelegramInlineButton[][] = [
    [
      { text: `🌐 ওয়েবসাইট ভিজিট`, url: bank.website },
      { text: `💻 ইন্টারনেট ব্যাংকিং`, url: bank.internetBankingUrl }
    ],
    [
      { text: `❓ ব্যাংকের FAQ ও প্রশ্নোত্তর`, callback_data: `faq:${bank.id}` },
      { text: `💳 কার্ড ব্লক হটলাইন`, callback_data: 'cmd:cardblock' }
    ],
    [
      { text: `🔙 ${CATEGORY_LABELS_BN[bank.category]?.split(' ')[0] || 'তালিকায়'} ফিরুন`, callback_data: `cat:${bank.category}` },
      { text: `🏠 মূল মেনু`, callback_data: 'menu:start' }
    ]
  ];

  return {
    text: msg,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Bank FAQ Handler
 */
function getBankFAQ(bankId: string): TelegramBotResponse {
  const bank = BANGLADESH_BANKS.find(b => b.id === bankId);
  if (!bank) {
    return getCategoriesMenu();
  }

  let text = `❓ *${bank.nameBn} (${bank.shortCode}) - সাধারণ প্রশ্নোত্তর:*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (bank.faq && bank.faq.length > 0) {
    bank.faq.forEach((f, idx) => {
      text += `*প্রশ্ন ${idx + 1}: ${f.qBn}*\n`;
      text += `👉 *উত্তর:* ${f.aBn}\n\n`;
    });
  } else {
    text += `• *হেল্পলাইন নম্বর:* \`${bank.helplineShort}\` এ কল করে ২৪/৭ যেকোনো তথ্য জানতে পারেন।\n`;
    text += `• *রাউটিং নম্বর:* \`${bank.routingNumber}\`\n`;
    text += `• *সুইফট কোড:* \`${bank.swiftCode}\`\n`;
    text += `• *ইন্টারনেট ব্যাংকিং:* ${bank.internetBankingUrl}\n\n`;
  }

  const buttons: TelegramInlineButton[][] = [
    [
      { text: `🏛️ ${bank.shortCode} বিস্তারিত বিবরণ`, callback_data: `bank:${bank.id}` },
      { text: `🌐 ব্যাংক ওয়েবসাইট`, url: bank.website }
    ],
    [
      { text: `🔙 ক্যাটাগরি তালিকা`, callback_data: `cat:${bank.category}` },
      { text: `🏠 মূল মেনু`, callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Document / Photo Upload Received Response
 */
export function getDocumentReceivedMenu(caption?: string, fromName?: string, imageUrl?: string): TelegramBotResponse {
  const newTicket = createSupportTicket({
    userName: fromName || 'টেলিগ্রাম গ্রাহক',
    type: 'document_verification',
    summary: caption && caption.trim().length > 0 ? caption.trim() : 'ডকুমেন্ট ও চেকবই যাচাইকরণ অনুসন্ধান',
    imageUrl: imageUrl
  });

  let text = `🖼️ *ডকুমেন্ট / ছবি সফলভাবে গ্রহণ করা হয়েছে*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📋 *স্ট্যাটাস:* সফলভাবে আপলোড সম্পন্ন ✅\n`;
  text += `🎫 *সাপোর্ট টিকিট আইডি:* \`${newTicket.id}\`\n`;
  if (caption && caption.trim().length > 0) {
    text += `📝 *বিবরণ / ক্যাপশন:* _${caption.trim()}_\n`;
  }
  text += `⏱️ *সময়:* ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}\n\n`;
  text += `ধন্যবাদ! আপনার ডকুমেন্ট সফলভাবে গ্রহণ করা হয়েছে। অ্যাকাউন্ট হোল্ডার ও সংশ্লিষ্ট তথ্য যাচাইকরণ সম্পন্ন করে ১ ঘণ্টার মধ্যে আপনার কাছে প্রয়োজনীয় আপডেট পাঠানো হবে। অনুগ্রহ করে অপেক্ষা করুন।\n`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: `👤 অ্যাকাউন্ট / শাখা তথ্য যাচাই`, callback_data: `doc:acc_info:${newTicket.id}` }
    ],
    [
      { text: `💬 ব্যাংকিং প্রতিনিধি সহায়তা অনুরোধ`, callback_data: `doc:support_req:${newTicket.id}` }
    ],
    [
      { text: `🔍 টিকিটের স্ট্যাটাস দেখুন`, callback_data: `ticket:status:${newTicket.id}` },
      { text: `🏠 মূল মেনু`, callback_data: `menu:start` }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown',
    ticketCreated: newTicket
  };
}

/**
 * Friday & Saturday Weekend / Holiday Notice
 */
export function getWeekendNoticeResponse(): TelegramBotResponse {
  let text = `🛑 *ব্যাংক সার্ভার ও শাখা লেনদেন বন্ধ (সাপ্তাহিক ছুটি)*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `বাংলাদেশ ব্যাংকের নিয়ম অনুযায়ী *শুক্রবার ও শনিবার* সকল তফসিলি ব্যাংকের স্বাভাবিক শাখা ও ক্লিয়ারিং লেনদেন কার্যক্রম বন্ধ থাকে।\n\n`;
  text += `📅 *পরামর্শ:* অনুগ্রহ করে *শুক্রবার ও শনিবারের পরের দিনগুলোতে* (রবিবার থেকে বৃহস্পতিবার অফিস সময়ে) পুনরায় চেষ্টা করুন।\n\n`;
  text += `⚡ *২৪/৭ সক্রিয় ডিজিটাল সেবাসমূহ:*\n`;
  text += `• সকল ব্যাংকের এটিএম (ATM) ও সিআরএম ক্যাশ ডিপোজিট বুথ\n`;
  text += `• ইন্টারনেট ব্যাংকিং ও মোবাইল অ্যাপ (NPSB, bKash, Nagad)\n`;
  text += `• ক্রেডিট/ডেবিট কার্ড লেনদেন ও জরুরি কার্ড ব্লক হেল্পলাইন\n\n`;
  text += `_জরুরি তথ্যের জন্য নিচের বাটনগুলো ব্যবহার করুন:_`;

  return {
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: `📞 ২৪/৭ হেল্পলাইন হটলাইন`, callback_data: `cmd:helpline` }, { text: `💳 জরুরি কার্ড ব্লক`, callback_data: `cmd:cardblock` }],
        [{ text: `⏰ লেনদেন ও ক্লিয়ারিং সময়সূচি`, callback_data: `cmd:timings` }, { text: `🏠 মূল মেনু`, callback_data: `menu:start` }]
      ]
    },
    parse_mode: 'Markdown'
  };
}

/**
 * Account / Branch Info verification in progress
 */
export function getAccountInfoProcessingResponse(ticketId?: string): TelegramBotResponse {
  const currentTicketId = ticketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  
  let text = `✅ *তথ্য যাচাইকরণ অনুরোধ গৃহীত হয়েছে*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🎫 *টিকিট রেফারেন্স:* \`${currentTicketId}\`\n`;
  text += `ধন্যবাদ আপনার তথ্য সংগ্রহের জন্য। বট সার্ভার থেকে সংশ্লিষ্ট শাখা ও প্রতিনিধির সাথে যোগাযোগ সম্পন্ন করা হচ্ছে।\n\n`;
  text += `⏳ *প্রক্রিয়াকরণ সময়:* অনুগ্রহ করে *১ ঘণ্টা* অপেক্ষা করুন।\n`;
  text += `🔒 *নিরাপত্তা ও সেবা:* আপনার অনুসন্ধান সফলভাবে সিস্টেমে নথিভুক্ত করা হয়েছে।\n\n`;
  text += `_জরুরি প্রয়োজনে যেকোনো সময় সরাসরি ব্যাংক হেল্পলাইনে যোগাযোগ করতে পারেন।_`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: `🔍 স্ট্যাটাস চেক করুন`, callback_data: `ticket:status:${currentTicketId}` },
      { text: `📞 সকল ব্যাংকের হটলাইন`, callback_data: `cmd:helpline` }
    ],
    [
      { text: `🚨 জরুরি কার্ড ব্লক`, callback_data: `cmd:cardblock` },
      { text: `🏠 মূল মেনু`, callback_data: `menu:start` }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Support request prompt
 */
export function getSupportRequestPromptResponse(ticketId?: string): TelegramBotResponse {
  let text = `💬 *ব্যাংকিং প্রতিনিধি সহায়তা ও অনুসন্ধান*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  if (ticketId) {
    text += `🎫 *টিকিট আইডি:* \`${ticketId}\`\n`;
  }
  text += `অ্যাকাউন্ট বা প্রতিনিধির সাথে যোগাযোগ করার জন্য আপনার মোবাইল নম্বর অথবা ইমেইল লিখে রিপ্লাই দিন।\n\n`;
  text += `⚙️ *সার্ভার প্রসেসিং সক্রিয়:* তথ্য পাওয়া মাত্র আমাদের প্রতিনিধি কার্যদিবসের মধ্যে আপনার সাথে যোগাযোগ করবেন।\n\n`;
  text += `⚠️ *নিরাপত্তা বার্তা:* কখনোই আপনার পাসওয়ার্ড, ওটিপি (OTP) বা এটিএম কার্ডের গোপন পিন (PIN) কাউকে প্রদান করবেন না।`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: `📞 হটলাইন তালিকা`, callback_data: `cmd:helpline` },
      { text: `⏰ লেনদেন সময়সূচি`, callback_data: `cmd:timings` }
    ],
    [
      { text: `🏠 মূল মেনু`, callback_data: `menu:start` }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Contact submitted response
 */
export function getContactSubmittedResponse(contactInfo: string, fromName?: string): TelegramBotResponse {
  const newTicket = createSupportTicket({
    userName: fromName || 'টেলিগ্রাম গ্রাহক',
    userContact: contactInfo,
    type: 'general_inquiry',
    summary: `গ্রাহক যোগাযোগ নম্বর প্রদান করেছেন: ${contactInfo}`
  });

  let text = `📨 *যোগাযোগের বিবরণী সফলভাবে গৃহীত হয়েছে*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🎫 *সাপোর্ট টিকিট রেফারেন্স:* \`${newTicket.id}\`\n`;
  text += `ধন্যবাদ! আপনার অনুসন্ধান ও যোগাযোগের বিবরণ (\`${contactInfo}\`) সফলভাবে প্রসেসিং সিস্টেমে নথিভুক্ত হয়েছে।\n\n`;
  text += `⚙️ *সার্ভার প্রসেসিং অন:* প্রক্রিয়াটি সম্পন্ন হলে আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবে।\n\n`;
  text += `জরুরি প্রয়োজনে সংশ্লিষ্ট ব্যাংকের ২৪/৭ হেল্পলাইনে সরাসরি কল করতে পারেন।`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: `🔍 স্ট্যাটাস চেক করুন`, callback_data: `ticket:status:${newTicket.id}` },
      { text: `📞 ব্যাংকের হটলাইন নম্বর`, callback_data: `cmd:helpline` }
    ],
    [
      { text: `🏠 মূল মেনু`, callback_data: `menu:start` }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown',
    ticketCreated: newTicket
  };
}

/**
 * Get Ticket Status
 */
export function getTicketStatusResponse(ticketIdQuery: string): TelegramBotResponse {
  const cleanId = ticketIdQuery.trim().toUpperCase();
  const foundTicket = SUPPORT_TICKETS_STORE.find(t => t.id.toUpperCase() === cleanId);

  if (!foundTicket) {
    return {
      text: `❌ *টিকিট খুঁজে পাওয়া যায়নি!*\n\n'${cleanId}' নম্বরের কোনো সক্রিয় টিকিট সিস্টেমে পাওয়া যায়নি।\n\nঅনুগ্রহ করে সঠিক ফরম্যাট লিখুন (যেমন: \`/status TKT-8941\`) অথবা নতুন অনুসন্ধানের জন্য ডকুমেন্ট বা বার্তা পাঠান।`,
      reply_markup: {
        inline_keyboard: [
          [{ text: `📋 ড্যাশবোর্ড টিকিট তালিকা`, callback_data: `cmd:tickets_list` }, { text: `🏠 মূল মেনু`, callback_data: `menu:start` }]
        ]
      },
      parse_mode: 'Markdown'
    };
  }

  const statusLabel = 
    foundTicket.status === 'resolved' ? '✅ সমাধান সম্পন্ন (Resolved)' :
    foundTicket.status === 'in_review' ? '⏳ পর্যালোচনাধীন (Under Review)' :
    '🕒 অপেক্ষমাণ (Pending)';

  let text = `🎫 *টিকিট অনুসন্ধান ফলাফল*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🆔 *টিকিট আইডি:* \`${foundTicket.id}\`\n`;
  text += `👤 *গ্রাহক:* ${foundTicket.userName}\n`;
  if (foundTicket.userContact) {
    text += `📞 *যোগাযোগ:* \`${foundTicket.userContact}\`\n`;
  }
  text += `📌 *বিষয়:* ${foundTicket.summary}\n`;
  text += `⚡ *বর্তমান স্ট্যাটাস:* *${statusLabel}*\n`;
  text += `📅 *তৈরি হয়েছে:* ${new Date(foundTicket.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}\n`;
  if (foundTicket.agentNotes) {
    text += `💬 *প্রতিনিধির নোট:* _${foundTicket.agentNotes}_\n`;
  }
  text += `\n_কোনো জরুরি সমস্যা হলে সরাসরি ব্যাংকের হেল্পলাইনে কল করুন।_`;

  return {
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: `🔄 রিফ্রেশ স্ট্যাটাস`, callback_data: `ticket:status:${foundTicket.id}` }, { text: `📞 হটলাইন`, callback_data: `cmd:helpline` }],
        [{ text: `🏠 মূল মেনু`, callback_data: `menu:start` }]
      ]
    },
    parse_mode: 'Markdown'
  };
}

/**
 * List all user tickets for quick checking
 */
export function getTicketsListResponse(): TelegramBotResponse {
  let text = `🎫 *সাম্প্রতিক সাপোর্ট টিকিটসমূহ*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `যেকোনো টিকিটের বর্তমান অবস্থা দেখতে নিচের বাটনে চাপুন অথবা \`/status TKT-XXXX\` কমান্ড পাঠান:\n\n`;

  const buttons: TelegramInlineButton[][] = [];

  SUPPORT_TICKETS_STORE.slice(0, 5).forEach(tkt => {
    const icon = tkt.status === 'resolved' ? '✅' : tkt.status === 'in_review' ? '⏳' : '🕒';
    buttons.push([
      { text: `${icon} ${tkt.id} - ${tkt.summary.slice(0, 22)}...`, callback_data: `ticket:status:${tkt.id}` }
    ]);
  });

  buttons.push([
    { text: `🏠 মূল মেনু`, callback_data: `menu:start` }
  ]);

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}


/**
 * Handle incoming user commands and queries
 */
export async function processTelegramMessage(input: {
  text?: string;
  callbackData?: string;
  fromName?: string;
  hasPhoto?: boolean;
  hasDocument?: boolean;
  caption?: string;
}): Promise<TelegramBotResponse> {
  const query = (input.text || '').trim();
  const callback = input.callbackData || '';

  // 0. Handle Photo or Document Upload
  if (input.hasPhoto || input.hasDocument) {
    return getDocumentReceivedMenu(input.caption || input.text, input.fromName);
  }

  // 1. Handle Callback Queries from Inline Buttons
  if (callback) {
    if (callback === 'menu:start' || callback === 'cmd:start') {
      return getWelcomeMenu(input.fromName);
    }
    if (callback.startsWith('doc:acc_info')) {
      const ticketId = callback.split(':')[2];
      return getAccountInfoProcessingResponse(ticketId);
    }
    if (callback.startsWith('doc:support_req')) {
      const ticketId = callback.split(':')[2];
      return getSupportRequestPromptResponse(ticketId);
    }
    if (callback.startsWith('ticket:status:')) {
      const ticketId = callback.replace('ticket:status:', '');
      return getTicketStatusResponse(ticketId);
    }
    if (callback === 'cmd:tickets_list') {
      return getTicketsListResponse();
    }
    if (callback.startsWith('bank:')) {
      const bankId = callback.replace('bank:', '');
      const bank = BANGLADESH_BANKS.find(b => b.id === bankId);
      if (bank) return formatBankDetailsTelegram(bank);
    }

    if (callback.startsWith('faq:')) {
      const bankId = callback.replace('faq:', '');
      return getBankFAQ(bankId);
    }
    if (callback.startsWith('cat:')) {
      const cat = callback.replace('cat:', '');
      return getBanksByCategory(cat);
    }
    if (callback === 'cmd:helpline') return getHelplineList();
    if (callback === 'cmd:swift') return getSwiftCodesList();
    if (callback === 'cmd:routing') return getRoutingList();
    if (callback === 'cmd:bkash') return getBkashTransferList();
    if (callback === 'cmd:islamic') return getIslamicBanksList();
    if (callback === 'cmd:govt') return getGovtBanksList();
    if (callback === 'cmd:foreign') return getForeignBanksList();
    if (callback === 'cmd:categories') return getCategoriesMenu();
    if (callback === 'cmd:help') return getHelpMenu();
    if (callback === 'cmd:cardblock') return getCardBlockHotlines();
    if (callback === 'cmd:complaint') return getComplaintGuide();
    if (callback === 'cmd:timings') return getClearingTimings();
    if (callback === 'cmd:weekend') return getWeekendNoticeResponse();
    if (callback === 'cmd:calc') return getCalculatorMenu();
    if (callback.startsWith('calc:emi:')) {
      const amountStr = callback.replace('calc:emi:', '');
      return calculateLoanEMI(parseInt(amountStr, 10) || 100000);
    }
  }

  // 2. Handle Text Commands
  const lowerQuery = query.toLowerCase();

  if (lowerQuery === '/start' || lowerQuery === 'start' || lowerQuery === 'hi' || lowerQuery === 'hello' || lowerQuery === 'সালাম' || lowerQuery === 'মেনু') {
    return getWelcomeMenu(input.fromName);
  }

  if (lowerQuery === '/banks' || lowerQuery === 'banks' || lowerQuery === 'ব্যাংক' || lowerQuery === 'সকল ব্যাংক') {
    return getCategoriesMenu();
  }

  if (lowerQuery === '/helpline' || lowerQuery === 'helpline' || lowerQuery === 'হটলাইন' || lowerQuery === 'হেল্পলাইন' || lowerQuery === 'কল সেন্টার') {
    return getHelplineList();
  }

  if (lowerQuery === '/cardblock' || lowerQuery === 'cardblock' || lowerQuery === 'কার্ড ব্লক' || lowerQuery === 'কার্ড বন্ধ') {
    return getCardBlockHotlines();
  }

  if (lowerQuery === '/swift' || lowerQuery === 'swift' || lowerQuery === 'সুইফট' || lowerQuery === 'swift code') {
    return getSwiftCodesList();
  }

  if (lowerQuery === '/routing' || lowerQuery === 'routing' || lowerQuery === 'রাউটিং' || lowerQuery === 'রাউটিং নম্বর') {
    return getRoutingList();
  }

  if (lowerQuery === '/bkash' || lowerQuery === 'bkash' || lowerQuery === 'বিকাশ' || lowerQuery === '/npsb' || lowerQuery === 'npsb') {
    return getBkashTransferList();
  }

  if (lowerQuery === '/islamic' || lowerQuery === 'islamic' || lowerQuery === 'ইসলামিক' || lowerQuery === 'ইসলামিক ব্যাংক') {
    return getIslamicBanksList();
  }

  if (lowerQuery === '/govt' || lowerQuery === 'govt' || lowerQuery === 'সরকারি' || lowerQuery === 'সরকারি ব্যাংক') {
    return getGovtBanksList();
  }

  if (lowerQuery === '/foreign' || lowerQuery === 'foreign' || lowerQuery === 'বিদেশি' || lowerQuery === 'বিদেশি ব্যাংক') {
    return getForeignBanksList();
  }

  if (lowerQuery === '/timings' || lowerQuery === 'timings' || lowerQuery === 'সময়সূচি' || lowerQuery === 'beftn সময়') {
    return getClearingTimings();
  }

  if (
    lowerQuery === '/weekend' || 
    lowerQuery === 'weekend' || 
    lowerQuery === '/holiday' || 
    lowerQuery === 'ছুটি' || 
    lowerQuery.includes('শুক্রবার') || 
    lowerQuery.includes('শনিবার') || 
    lowerQuery.includes('সার্ভার বন্ধ')
  ) {
    return getWeekendNoticeResponse();
  }

  if (lowerQuery === '/complaint' || lowerQuery === 'complaint' || lowerQuery === 'অভিযোগ' || lowerQuery === 'বাংলাদেশ ব্যাংক হেল্পলাইন') {
    return getComplaintGuide();
  }

  if (lowerQuery === '/calc' || lowerQuery === '/emi' || lowerQuery === 'calc' || lowerQuery === 'emi' || lowerQuery === 'ক্যালকুলেটর') {
    return getCalculatorMenu();
  }

  if (lowerQuery === '/help' || lowerQuery === 'help' || lowerQuery === 'সাহায্য' || lowerQuery === 'হেল্প') {
    return getHelpMenu();
  }

  if (lowerQuery === '/ticket' || lowerQuery === '/tickets' || lowerQuery === 'টিকিট') {
    return getTicketsListResponse();
  }

  if (lowerQuery.startsWith('/status') || lowerQuery.startsWith('status') || lowerQuery.startsWith('স্ট্যাটাস')) {
    const ticketIdPart = query.replace(/^\/(status|স্ট্যাটাস)\s*/i, '').replace(/^status\s*/i, '').trim();
    if (ticketIdPart) {
      return getTicketStatusResponse(ticketIdPart);
    }
    return getTicketsListResponse();
  }

  if (lowerQuery.startsWith('/search ') || lowerQuery.startsWith('search ') || lowerQuery.startsWith('খুঁজুন ')) {
    const searchTerm = query.replace(/^\/(search|খুঁজুন)\s+/i, '').replace(/^search\s+/i, '').trim();
    return performBankSearch(searchTerm);
  }

  // 3. Check direct match with any bank name / short code
  const exactMatch = BANGLADESH_BANKS.find(b => 
    b.id === lowerQuery ||
    b.shortCode.toLowerCase() === lowerQuery ||
    b.nameEn.toLowerCase() === lowerQuery ||
    b.nameBn.toLowerCase().includes(lowerQuery) ||
    lowerQuery.includes(b.shortCode.toLowerCase())
  );

  if (exactMatch && lowerQuery.length > 2) {
    return formatBankDetailsTelegram(exactMatch);
  }

  // 4. Contact Phone/Email submission detection
  const phonePattern = /(?:\+?880|0)?1[3-9]\d{8}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (phonePattern.test(query) || emailPattern.test(query)) {
    const contactMatch = query.match(phonePattern)?.[0] || query.match(emailPattern)?.[0] || query;
    return getContactSubmittedResponse(contactMatch);
  }

  // 5. Perform keyword search
  const searchResults = performBankSearch(query);
  if (searchResults.text.indexOf('পাওয়া যায়নি') === -1) {
    return searchResults;
  }

  // 5. If no exact match and Gemini is available, answer via AI assistant
  const ai = getGemini();
  if (ai && query.length >= 3) {
    try {
      const bankContext = BANGLADESH_BANKS.slice(0, 30).map(b => 
        `${b.nameBn} (${b.nameEn} - ${b.shortCode}): Helpline ${b.helplineShort}, Routing ${b.routingNumber}, SWIFT ${b.swiftCode}, Category: ${b.category}, bKash: ${b.bKashTransfer.npsbTransfer ? 'Yes' : 'No'}`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `User Query: "${query}". Context of Bangladesh Banks:\n${bankContext}\n\nTask: Provide a concise, highly polite, accurate response in Bengali (with key numbers like Helpline, SWIFT or Routing code formatted in Markdown backticks). Keep it helpful for a Telegram bot user.`,
        config: {
          systemInstruction: 'You are the Bangladesh Banks Official Telegram Bot Assistant. Respond politely in clear Bengali with precise banking details, hotlines, or routing guidance.'
        }
      });

      const aiText = response.text || '';
      if (aiText) {
        return {
          text: `🤖 *ব্যাংকিং এআই অ্যাসিস্ট্যান্ট:*\n\n${aiText}\n\n_অন্যান্য তথ্য দেখতে নিচের বাটন চাপুন:_`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔍 ব্যাংক ব্রাউজ করুন', callback_data: 'cmd:categories' }, { text: '📞 হেল্পলাইন তালিকা', callback_data: 'cmd:helpline' }],
              [{ text: '💳 কার্ড ব্লক হটলাইন', callback_data: 'cmd:cardblock' }, { text: '🏠 মূল মেনু', callback_data: 'menu:start' }]
            ]
          },
          parse_mode: 'Markdown'
        };
      }
    } catch (e) {
      console.warn('Gemini query fallback failed:', e);
    }
  }

  // 6. Default Fallback
  return {
    text: `❌ দুঃখিত! "*${query}*" সংক্রান্ত কোনো ব্যাংক সরাসরি খুঁজে পাওয়া যায়নি।\n\n💡 *পরামর্শ:* ব্যাংকের নাম (যেমন: ব্র্যাক, সোনালী, City Bank), শর্টকোড (যেমন: EBL, IBBL, SCB) বা রাউটিং প্রিফিক্স লিখে সার্চ করুন।`,
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏛️ সকল ব্যাংকের তালিকা', callback_data: 'cmd:categories' }],
        [{ text: '📞 হেল্পলাইন হটলাইন', callback_data: 'cmd:helpline' }, { text: '🌐 সুইফট কোড', callback_data: 'cmd:swift' }],
        [{ text: '🏠 মূল মেনু', callback_data: 'menu:start' }]
      ]
    },
    parse_mode: 'Markdown'
  };
}

/**
 * Start/Welcome Menu
 */
function getWelcomeMenu(fromName?: string): TelegramBotResponse {
  const name = fromName ? ` *${fromName}*` : '';
  const text = `👋 আসসালামু আলাইকুম${name}!\n\n` +
    `🇧🇩 *বাংলাদেশ ব্যাংক তথ্যভাণ্ডার ও টেলিগ্রাম বটে স্বাগতম!*\n` +
    `এখানে আপনি বাংলাদেশের সকল তফসিলি ও বিশেষায়িত ব্যাংকের হেল্পলাইন, রাউটিং নম্বর, সুইফট কোড, ইন্টারনেট ব্যাংকিং, কার্ড সাপোর্ট ও বিকাশ ট্রান্সফার সংক্রান্ত বিস্তারিত তথ্য পাবেন।\n\n` +
    `👇 *যে তথ্যটি জানতে চান নিচের বাটনে চাপুন অথবা কমান্ড পাঠান:*`;

  const inline_keyboard: TelegramInlineButton[][] = [
    [
      { text: '🏛️ সকল ব্যাংক (Categories)', callback_data: 'cmd:categories' },
      { text: '📞 ২৪/৭ হেল্পলাইন হটলাইন', callback_data: 'cmd:helpline' }
    ],
    [
      { text: '🔢 রাউটিং নম্বর ফাইন্ডার', callback_data: 'cmd:routing' },
      { text: '🌐 SWIFT / রেমিট্যান্স কোড', callback_data: 'cmd:swift' }
    ],
    [
      { text: '📲 বিকাশ/NPSB ট্রান্সফার', callback_data: 'cmd:bkash' },
      { text: '🕌 ইসলামিক শরীয়াহ ব্যাংক', callback_data: 'cmd:islamic' }
    ],
    [
      { text: '💳 জরুরি কার্ড ব্লক হটলাইন', callback_data: 'cmd:cardblock' },
      { text: '⏰ ব্যাংক লেনদেন সময়সূচি', callback_data: 'cmd:timings' }
    ],
    [
      { text: '🛑 শুক্রবার-শনিবার ছুটি নোটিশ', callback_data: 'cmd:weekend' },
      { text: '🎫 সাপোর্ট টিকিট ইনবক্স', callback_data: 'cmd:tickets_list' }
    ],
    [
      { text: '🧮 লোন ও ডিপিএস ক্যালকুলেটর', callback_data: 'cmd:calc' },
      { text: '⚖️ বাংলাদেশ ব্যাংক অভিযোগ (16236)', callback_data: 'cmd:complaint' }
    ],
    [
      { text: '📖 বট ব্যবহারের নিয়মাবলী (/help)', callback_data: 'cmd:help' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard },
    parse_mode: 'Markdown'
  };
}

/**
 * Categories Menu
 */
function getCategoriesMenu(): TelegramBotResponse {
  const text = `📁 *ব্যাংকের ক্যাটাগরি নির্বাচন করুন:*\n\n` +
    `বাংলাদেশের মোট ৬১টি তফসিলি ব্যাংককে নিম্নলিখিত প্রধান ক্যাটাগরিতে ভাগ করা হয়েছে। বিস্তারিত তালিকা দেখতে বাটন চাপুন:`;

  const inline_keyboard: TelegramInlineButton[][] = [
    [{ text: '🏛️ ১. রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক (৬টি)', callback_data: 'cat:state_owned' }],
    [{ text: '🏢 ২. বেসরকারি বাণিজ্যিক ব্যাংক (৩৩টি)', callback_data: 'cat:private_conventional' }],
    [{ text: '🕌 ৩. ইসলামিক শরীয়াহ ব্যাংক (১০টি)', callback_data: 'cat:islamic' }],
    [{ text: '🌾 ৪. বিশেষায়িত উন্নয়ন ব্যাংক (৩টি)', callback_data: 'cat:specialized' }],
    [{ text: '🌍 ৫. বিদেশি বাণিজ্যিক ব্যাংক (৯টি)', callback_data: 'cat:foreign' }],
    [{ text: '🏠 মূল মেনুতে ফিরুন', callback_data: 'menu:start' }]
  ];

  return {
    text,
    reply_markup: { inline_keyboard },
    parse_mode: 'Markdown'
  };
}

/**
 * Banks by Category
 */
function getBanksByCategory(category: string): TelegramBotResponse {
  const filtered = BANGLADESH_BANKS.filter(b => b.category === category);
  const catTitle = CATEGORY_LABELS_BN[category] || category;

  let text = `🏛️ *${catTitle}* (${filtered.length}টি)\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `যেকোনো ব্যাংকের বিস্তারিত তথ্য দেখতে নিচে ক্লিক করুন:\n\n`;

  const buttons: TelegramInlineButton[][] = [];
  
  for (let i = 0; i < filtered.length; i += 2) {
    const row: TelegramInlineButton[] = [];
    const b1 = filtered[i];
    row.push({ text: `${b1.shortCode} - ${b1.nameBn.split(' ')[0]}`, callback_data: `bank:${b1.id}` });
    
    if (filtered[i + 1]) {
      const b2 = filtered[i + 1];
      row.push({ text: `${b2.shortCode} - ${b2.nameBn.split(' ')[0]}`, callback_data: `bank:${b2.id}` });
    }
    buttons.push(row);
  }

  buttons.push([
    { text: '📁 অন্য ক্যাটাগরি', callback_data: 'cmd:categories' },
    { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
  ]);

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Search Bank
 */
function performBankSearch(term: string): TelegramBotResponse {
  const cleanTerm = term.toLowerCase().trim();
  if (!cleanTerm) {
    return {
      text: `🔍 *ব্যাংক অনুসন্ধান নির্দেশিকা:*\n\nঅনুগ্রহ করে যেকোনো ব্যাংকের নাম অথবা শর্টকোড লিখে পাঠান।\nউদাহরণ: \`/search brac\` অথবা \`ইসলামী ব্যাংক\` বা \`16221\``,
      reply_markup: {
        inline_keyboard: [[{ text: '🏠 মূল মেনু', callback_data: 'menu:start' }]]
      },
      parse_mode: 'Markdown'
    };
  }

  const matches = BANGLADESH_BANKS.filter(b => 
    b.nameBn.toLowerCase().includes(cleanTerm) ||
    b.nameEn.toLowerCase().includes(cleanTerm) ||
    b.shortCode.toLowerCase().includes(cleanTerm) ||
    b.routingNumber.includes(cleanTerm) ||
    b.swiftCode.toLowerCase().includes(cleanTerm) ||
    b.helplineShort.includes(cleanTerm)
  );

  if (matches.length === 1) {
    return formatBankDetailsTelegram(matches[0]);
  }

  if (matches.length > 1) {
    let text = `🔍 "*${term}*" দিয়ে মোট *${matches.length}টি* ব্যাংক পাওয়া গেছে:\n\n`;
    const buttons: TelegramInlineButton[][] = [];

    matches.slice(0, 10).forEach(b => {
      text += `• *${b.nameBn}* (${b.shortCode}) - হেল্পলাইন: \`${b.helplineShort}\`\n`;
      buttons.push([{ text: `👉 ${b.nameBn} (${b.shortCode})`, callback_data: `bank:${b.id}` }]);
    });

    buttons.push([{ text: '🏠 মূল মেনু', callback_data: 'menu:start' }]);

    return {
      text,
      reply_markup: { inline_keyboard: buttons },
      parse_mode: 'Markdown'
    };
  }

  return {
    text: `❌ "*${term}*" দিয়ে কোনো ব্যাংক খুঁজে পাওয়া যায়নি।\n\nবানান সঠিক কিনা যাচাই করুন অথবা ব্যাংকের ইংরেজি কোড দিয়ে চেষ্টা করুন (যেমন: EBL, BRAC, CITY, SBL, IBBL)।`,
    reply_markup: {
      inline_keyboard: [
        [{ text: '📁 সকল ব্যাংক দেখুন', callback_data: 'cmd:categories' }],
        [{ text: '🏠 মূল মেনু', callback_data: 'menu:start' }]
      ]
    },
    parse_mode: 'Markdown'
  };
}

/**
 * 24/7 Helpline Hotlines List
 */
function getHelplineList(): TelegramBotResponse {
  let text = `📞 *বাংলাদেশের প্রধান ব্যাংকসমূহের ২৪/৭ কল সেন্টার ও হেল্পলাইন:* \n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const topBanks = BANGLADESH_BANKS.slice(0, 20);
  topBanks.forEach((b, idx) => {
    text += `${idx + 1}. *${b.nameBn}:* \`${b.helplineShort}\`\n`;
  });

  text += `\n💡 _যেকোনো ব্যাংকের বিস্তারিত দেখতে নিচে ক্লিক করুন:_`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: 'ব্র্যাক (16221)', callback_data: 'bank:brac-bank' },
      { text: 'সিটি ব্যাংক (16234)', callback_data: 'bank:city-bank' }
    ],
    [
      { text: 'ইসলামী ব্যাংক (16259)', callback_data: 'bank:islami-bank-bangladesh' },
      { text: 'ইবিএল (16230)', callback_data: 'bank:eastern-bank' }
    ],
    [
      { text: 'ডাচ-বাংলা (16216)', callback_data: 'bank:dutch-bangla-bank' },
      { text: 'সোনালী ব্যাংক (16639)', callback_data: 'bank:sonali-bank' }
    ],
    [
      { text: '💳 জরুরি কার্ড ব্লক হটলাইন', callback_data: 'cmd:cardblock' },
      { text: '📁 অন্যান্য ব্যাংকের তালিকা', callback_data: 'cmd:categories' }
    ],
    [
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Emergency Card Blocking Hotlines
 */
function getCardBlockHotlines(): TelegramBotResponse {
  let text = `💳 *জরুরি ডেবিট ও ক্রেডিট কার্ড ব্লক হটলাইন:* \n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `কার্ড হারিয়ে গেলে বা জালিয়াতির সন্দেহ হলে তাৎক্ষণিক নিচের হটলাইনে কল করে কার্ড সাময়িক বা স্থায়ীভাবে বন্ধ করুন:\n\n`;

  const cardHotlineBanks = BANGLADESH_BANKS.filter(b => b.cardHotline).slice(0, 15);
  cardHotlineBanks.forEach(b => {
    text += `🚨 *${b.nameBn} (${b.shortCode}):* \`${b.cardHotline}\`\n`;
  });

  text += `\n💡 _টিপস: ব্যাংকিং অ্যাপের "Card Lock" বা "Card Management" অপশন থেকেও এক ক্লিকে কার্ড সাময়িক লক করা যায়।_`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: 'ব্র্যাক কার্ড সাপোর্ট', callback_data: 'bank:brac-bank' },
      { text: 'সিটি কার্ড সাপোর্ট', callback_data: 'bank:city-bank' }
    ],
    [
      { text: 'ইবিএল কার্ড সাপোর্ট', callback_data: 'bank:eastern-bank' },
      { text: 'ডিবিবিএল কার্ড সাপোর্ট', callback_data: 'bank:dutch-bangla-bank' }
    ],
    [
      { text: '📞 সকল হেল্পলাইন', callback_data: 'cmd:helpline' },
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * SWIFT Codes List
 */
function getSwiftCodesList(): TelegramBotResponse {
  let text = `🌐 *বিদেশি রেমিট্যান্স ও ফান্ড ট্রান্সফারের জন্য প্রধান SWIFT/BIC কোডসমূহ:*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  BANGLADESH_BANKS.slice(0, 18).forEach(b => {
    text += `• *${b.nameEn}* (${b.shortCode}): \`${b.swiftCode}\`\n`;
  });

  text += `\n💡 _রেমিট্যান্স প্রেরণের সময় ৮ বা ১১ ডিজিটের এই SWIFT কোড এবং আপনার ব্যাংক অ্যাকাউন্ট নম্বর ব্যবহার করুন।_`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: 'ব্র্যাক ব্যাংক SWIFT', callback_data: 'bank:brac-bank' },
      { text: 'সোনালী ব্যাংক SWIFT', callback_data: 'bank:sonali-bank' }
    ],
    [
      { text: 'ইসলামী ব্যাংক SWIFT', callback_data: 'bank:islami-bank-bangladesh' },
      { text: 'সিটি ব্যাংক SWIFT', callback_data: 'bank:city-bank' }
    ],
    [
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Routing Numbers List
 */
function getRoutingList(): TelegramBotResponse {
  let text = `🔢 *প্রধান ব্যাংকসমূহের হেড অফিস রাউটিং নম্বর প্রিফিক্স:*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_বিএফটিএন (BEFTN), এনপিএসবি (NPSB) বা আরটিজিএস (RTGS) করার জন্য ৯ ডিজিটের রাউটিং নম্বর প্রয়োজন হয়:_\n\n`;

  BANGLADESH_BANKS.slice(0, 15).forEach(b => {
    text += `• *${b.nameBn}:* \`${b.routingNumber}\` (Pre: ${b.routingPrefix})\n`;
  });

  text += `\n💡 _যেকোনো নির্দিষ্ট ব্রাঞ্চের রাউটিং নম্বরের প্রথম ৩ ডিজিট সাধারণত ব্যাংকের নির্দিষ্ট প্রিফিক্স দিয়ে শুরু হয়।_`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: '🔍 নির্দিষ্ট ব্যাংক খুঁজুন', callback_data: 'cmd:categories' },
      { text: '⏰ ক্লিয়ারিং সময়সূচি', callback_data: 'cmd:timings' }
    ],
    [
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * bKash & NPSB Transfer Banks
 */
function getBkashTransferList(): TelegramBotResponse {
  const bkashBanks = BANGLADESH_BANKS.filter(b => b.bKashTransfer.npsbTransfer || b.bKashTransfer.bkashAddMoney);

  let text = `📲 *বিকাশ (bKash) ও এনপিএসবি ব্যাংক ট্রান্সফার তালিকা:*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `বিকাশ অ্যাপের *Bank Transfer (NPSB)* এবং *Internet Banking* এর মাধ্যমে টাকা পাঠানো ও অ্যাড মানি করা যায় এমন ব্যাংকসমূহ:\n\n`;

  bkashBanks.slice(0, 16).forEach(b => {
    text += `✅ *${b.nameBn}* (${b.shortCode})\n   ↳ অ্যাপ: _${b.mobileAppName}_\n`;
  });

  text += `\n💡 _বিস্তারিত জানতে ব্যাংকের নামের বাটনে চাপুন:_`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: 'ব্র্যাক ব্যাংক', callback_data: 'bank:brac-bank' },
      { text: 'সিটি ব্যাংক', callback_data: 'bank:city-bank' }
    ],
    [
      { text: 'ইসলামী ব্যাংক', callback_data: 'bank:islami-bank-bangladesh' },
      { text: 'ডাচ-বাংলা', callback_data: 'bank:dutch-bangla-bank' }
    ],
    [
      { text: 'মিউচুয়াল ট্রাস্ট', callback_data: 'bank:mutual-trust-bank' },
      { text: 'পূবালী ব্যাংক', callback_data: 'bank:pubali-bank' }
    ],
    [
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard: buttons },
    parse_mode: 'Markdown'
  };
}

/**
 * Clearing & Transaction Timings Guide
 */
function getClearingTimings(): TelegramBotResponse {
  const text = `⏰ *বাংলাদেশ ইন্টারব্যাংক পেমেন্ট ও সেটেলমেন্ট সময়সূচি:*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `⚡ *১. NPSB (National Payment Switch Bangladesh):*\n` +
    `• সময়: ২৪ ঘণ্টা / ৭ দিন (Instant Realtime)\n` +
    `• মাধ্যম: এটিএম, পয়েন্ট অব সেল (POS), ইন্টারনেট ব্যাংকিং ও এমএফএস (বিকাশ/নগদ/রকেট)\n` +
    `• লেনদেনের সর্বোচ্চ সীমা: সাধারণত ব্যাংকভেদে প্রতিবার ৫০,০০০ - ৩,০০,০০০ টাকা।\n\n` +
    `🏦 *২. BEFTN (ইলেকট্রনিক ফান্ড ট্রান্সফার):*\n` +
    `• সময়: কর্মদিবসে দৈনিক ২টি সেশন (সকাল ও দুপুর)\n` +
    `• ক্লিয়ারিং: একই দিন বা পরবর্তী কার্যদিবসে ফান্ড যুক্ত হয়।\n` +
    `• চার্জ: সাধারণত ফ্রি।\n\n` +
    `🚀 *৩. RTGS (রিয়েল টাইম গ্রস সেটেলমেন্ট):*\n` +
    `• সময়: সকাল ১০:০০ টা থেকে বিকাল ৪:০০ টা (কর্মদিবসে)\n` +
    `• ন্যূনতম লেনদেন: ১,০০,০০০ টাকা বা সমপরিমাণ বৈদেশিক মুদ্রা (তাত্ক্ষণিক সেটেলমেন্ট)।\n\n` +
    `🕒 *৪. সাধারণ ব্যাংক কাউন্টার সময়:* সকাল ১০:০০ টা - বিকাল ৩:৩০ টা (শাখাভেদে ৪:০০ টা)।`;

  const inline_keyboard: TelegramInlineButton[][] = [
    [
      { text: '🔢 রাউটিং নম্বর ফাইন্ডার', callback_data: 'cmd:routing' },
      { text: '📲 বিকাশ/NPSB ব্যাংক', callback_data: 'cmd:bkash' }
    ],
    [
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard },
    parse_mode: 'Markdown'
  };
}

/**
 * Bangladesh Bank Complaints and Customer Support
 */
function getComplaintGuide(): TelegramBotResponse {
  const text = `⚖️ *বাংলাদেশ ব্যাংক ফাইন্যান্সিয়াল ইন্টিগ্রিটি ও গ্রাহক সুরক্ষা শাখা:* \n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `যেকোনো ব্যাংক কর্তৃক গ্রাহক হয়রানি, অবৈধ চার্জ কর্তন, এটিএম প্রতারণা বা সেবায় অসন্তোষ হলে নিচের মাধ্যমে অভিযোগ দাখিল করা যায়:\n\n` +
    `📞 *হটলাইন কল সেন্টার:* \`16236\` (সকাল ৯:০০ - বিকাল ৫:০০)\n` +
    `🌐 *অনলাইন পোর্টাল:* https://cms.bb.org.bd\n` +
    `📧 *ইমেইল:* \`bb.cprd@bb.org.bd\`\n` +
    `🏢 *ঠিকানা:* মহাব্যবস্থাপক, ফাইন্যান্সিয়াল ইন্টিগ্রিটি অ্যান্ড কাস্টমার সার্ভিসেস ডিপার্টমেন্ট (FICSD), বাংলাদেশ ব্যাংক, প্রধান কার্যালয়, মতিঝিল, ঢাকা।\n\n` +
    `💡 *পরামর্শ:* বাংলাদেশ ব্যাংকে অভিযোগ করার আগে প্রথমে সংশ্লিষ্ট ব্যাংকের প্রধান কার্যালয়ের অভিযোগ সেলে লিখিত জানান এবং ৭-১৫ কার্যদিবস অপেক্ষা করুন।`;

  const inline_keyboard: TelegramInlineButton[][] = [
    [
      { text: '🌐 BB কমপ্লেইন্ট পোর্টাল', url: 'https://cms.bb.org.bd' },
      { text: '📞 ব্যাংক হেল্পলাইন', callback_data: 'cmd:helpline' }
    ],
    [
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard },
    parse_mode: 'Markdown'
  };
}

/**
 * Banking Calculator Menu
 */
function getCalculatorMenu(): TelegramBotResponse {
  const text = `🧮 *ব্যাংকিং ও লোন ইএমআই (EMI) ক্যালকুলেটর:*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `দ্রুত আনুমানিক মাসিক কিস্তি (EMI) দেখতে নিচের যেকোনো লোন পরিমাণের বাটনে চাপুন (ধরা হয়েছে ৯% সুদের হার ও ১ বছর মেয়াদ):\n\n` +
    `💡 অথবা নির্দিষ্ট হিসাব করতে চ্যাটে লিখুন (যেমন: "৫০ হাজার টাকা ১ বছর লোন কিস্তি")।`;

  const inline_keyboard: TelegramInlineButton[][] = [
    [
      { text: '💰 ৫০,০০০ টাকা লোন', callback_data: 'calc:emi:50000' },
      { text: '💰 ১,০০,০০০ টাকা লোন', callback_data: 'calc:emi:100000' }
    ],
    [
      { text: '💰 ৩,০০,০০০ টাকা লোন', callback_data: 'calc:emi:300000' },
      { text: '💰 ৫,০০,০০০ টাকা লোন', callback_data: 'calc:emi:500000' }
    ],
    [
      { text: '💰 ১০,০০,০০০ টাকা লোন', callback_data: 'calc:emi:100000' },
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard },
    parse_mode: 'Markdown'
  };
}

/**
 * Calculate Loan EMI for Telegram
 */
function calculateLoanEMI(principal: number): TelegramBotResponse {
  const annualRate = 9; // 9% average
  const months = 12; // 1 year
  const monthlyRate = (annualRate / 100) / 12;
  
  const emi = Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  let text = `📊 *লোন ইএমআই হিসাব (আনুমানিক ৯% হারে):*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💵 *মূল টাকা:* \`${principal.toLocaleString('bn-BD')}\` ৳\n`;
  text += `⏳ *মেয়াদ:* ১২ মাস (১ বছর)\n`;
  text += `📈 *সুদের হার:* আনুমানিক ৯.০০%\n\n`;
  text += `📌 *মাসিক কিস্তি (EMI):* \`${emi.toLocaleString('bn-BD')}\` ৳ / মাস\n`;
  text += `💰 *মোট পরিশোধ:* \`${totalPayment.toLocaleString('bn-BD')}\` ৳\n`;
  text += `💸 *মোট অতিরিক্ত মুনাফা/সুদ:* \`${totalInterest.toLocaleString('bn-BD')}\` ৳\n\n`;
  text += `_নোট: বিভিন্ন ব্যাংকে প্রসেসিং ফি ও সুদের হার কিছুটা কম-বেশি হতে পারে।_`;

  const inline_keyboard: TelegramInlineButton[][] = [
    [
      { text: '🔄 অন্য পরিমাণের হিসাব', callback_data: 'cmd:calc' },
      { text: '🏛️ ব্যাংক তালিকা', callback_data: 'cmd:categories' }
    ],
    [
      { text: '🏠 মূল মেনু', callback_data: 'menu:start' }
    ]
  ];

  return {
    text,
    reply_markup: { inline_keyboard },
    parse_mode: 'Markdown'
  };
}

/**
 * Islamic Banks List
 */
function getIslamicBanksList(): TelegramBotResponse {
  return getBanksByCategory('islamic');
}

/**
 * Govt & Specialized Banks List
 */
function getGovtBanksList(): TelegramBotResponse {
  return getBanksByCategory('state_owned');
}

/**
 * Foreign Banks List
 */
function getForeignBanksList(): TelegramBotResponse {
  return getBanksByCategory('foreign');
}

/**
 * Help Menu
 */
function getHelpMenu(): TelegramBotResponse {
  const text = `📖 *টেলিগ্রাম বট কমান্ড সহায়িকা:*\n\n` +
    `• \`/start\` - মূল মেনু ও দ্রুত অ্যাকশন বাটন\n` +
    `• \`/banks\` - ক্যাটাগরি ভিত্তিক সকল ৬১টি ব্যাংক\n` +
    `• \`/search <নাম>\` - নাম, কোড বা রাউটিং দিয়ে সার্চ (উদা: \`/search brac\`)\n` +
    `• \`/helpline\` - সকল ব্যাংকের ২৪/৭ হেল্পলাইন হটলাইন\n` +
    `• \`/cardblock\` - ডেবিট/ক্রেডিট কার্ড হারানোর জরুরি হটলাইন\n` +
    `• \`/swift\` - আন্তর্জাতিক রেমিট্যান্সের সুইফট কোড\n` +
    `• \`/routing\` - বিএফটিএন ও এনপিএসবি রাউটিং নম্বর\n` +
    `• \`/bkash\` - বিকাশ ও ব্যাংক ট্রান্সফার তথ্য\n` +
    `• \`/islamic\` - ১০টি পূর্ণাঙ্গ ইসলামী শরীয়াহ ব্যাংক\n` +
    `• \`/govt\` - সকল সরকারি ও রাষ্ট্রায়ত্ত ব্যাংক\n` +
    `• \`/foreign\` - বিদেশি বাণিজ্যিক ব্যাংকসমূহ\n` +
    `• \`/timings\` - বিএফটিএন, এনপিএসবি ও আরটিজিএস লেনদেন সময়\n` +
    `• \`/complaint\` - বাংলাদেশ ব্যাংক হেল্পলাইন (16236)\n` +
    `• \`/calc\` - লোন কিস্তি ও ইএমআই (EMI) ক্যালকুলেটর\n\n` +
    `💡 *টিপস:* আপনি সরাসরি ব্যাংকের নাম (যেমন "ইবিএল" বা "City Bank") লিখে পাঠালেও বট স্বয়ংক্রিয়ভাবে বিস্তারিত তথ্য প্রদর্শন করবে।`;

  const inline_keyboard: TelegramInlineButton[][] = [
    [{ text: '🏛️ ব্যাংকের ক্যাটাগরি ব্রাউজ করুন', callback_data: 'cmd:categories' }],
    [{ text: '📞 হেল্পলাইন তালিকা', callback_data: 'cmd:helpline' }, { text: '💳 কার্ড ব্লক হটলাইন', callback_data: 'cmd:cardblock' }],
    [{ text: '🏠 মূল মেনু', callback_data: 'menu:start' }]
  ];

  return {
    text,
    reply_markup: { inline_keyboard },
    parse_mode: 'Markdown'
  };
}

