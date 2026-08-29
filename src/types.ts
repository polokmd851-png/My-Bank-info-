export type BankCategory = 
  | 'state_owned' 
  | 'private_conventional' 
  | 'islamic' 
  | 'specialized' 
  | 'foreign'
  | 'mfs_digital';

export interface BankInfo {
  id: string;
  nameBn: string;
  nameEn: string;
  shortCode: string;
  category: BankCategory;
  isIslamic: boolean;
  establishedYear: number;
  headOffice: string;
  swiftCode: string;
  routingNumber: string;
  routingPrefix: string;
  helpline: string;
  helplineShort: string;
  tollFree?: string;
  cardHotline?: string;
  email: string;
  website: string;
  internetBankingUrl: string;
  mobileAppName: string;
  mobileAppIos?: string;
  mobileAppAndroid?: string;
  ussdCode?: string;
  branchesCount?: number;
  atmsCount?: number;
  color: string;
  logoBg: string;
  bKashTransfer: {
    npsbTransfer: boolean;
    bkashAddMoney: boolean;
    internetBankingTransfer: boolean;
    chargeNoteBn: string;
  };
  featuresBn: string[];
  descriptionBn: string;
  remittanceNoteBn?: string;
  faq?: Array<{ qBn: string; aBn: string }>;
}

export interface TelegramBotStats {
  totalBanks: number;
  activeWebhooks: number;
  queriesProcessed: number;
  supportedTransferBanks: number;
  serverUptimeSeconds: number;
  botConfigured: boolean;
  botUsername?: string;
}

export interface BotChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  imageUrl?: string;
  buttons?: Array<{ text: string; callbackData?: string; url?: string }>;
  isError?: boolean;
}

export type TicketStatus = 'pending' | 'in_review' | 'resolved';

export interface SupportTicket {
  id: string; // e.g. TKT-8942
  userName: string;
  userContact?: string;
  type: 'document_verification' | 'general_inquiry' | 'card_assistance';
  summary: string;
  imageUrl?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  agentNotes?: string;
}

