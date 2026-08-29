import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { BANGLADESH_BANKS } from './src/data/banksData';
import { 
  processTelegramMessage, 
  TelegramBotResponse, 
  SUPPORT_TICKETS_STORE, 
  createSupportTicket 
} from './server/telegramBot';

dotenv.config();

const app = express();
const PORT = 3000;
const startTime = Date.now();
let queriesProcessedCount = 42;

let activeTelegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
let isPollingActive = false;
let pollingAbortController: AbortController | null = null;
let currentBotInfo: any = null;

app.use(express.json());

// ======================= TELEGRAM BOT POLLING ENGINE =======================

async function handleTelegramUpdate(update: any, botToken: string) {
  try {
    queriesProcessedCount++;
    console.log('[Telegram Engine] Update received:', update.update_id);

    let chatId: number | string | null = null;
    let messageText: string | undefined;
    let callbackData: string | undefined;
    let fromName: string = 'User';
    let callbackQueryId: string | undefined;
    let hasPhoto = false;
    let hasDocument = false;
    let caption: string | undefined;

    if (update.message) {
      chatId = update.message.chat?.id;
      messageText = update.message.text;
      fromName = update.message.from?.first_name || 'Friend';
      caption = update.message.caption;
      if (update.message.photo && Array.isArray(update.message.photo) && update.message.photo.length > 0) {
        hasPhoto = true;
      }
      if (update.message.document) {
        hasDocument = true;
      }
    } else if (update.callback_query) {
      chatId = update.callback_query.message?.chat?.id;
      callbackData = update.callback_query.data;
      callbackQueryId = update.callback_query.id;
      fromName = update.callback_query.from?.first_name || 'Friend';
    }

    if (!chatId) return;

    // Process logic
    const botResponse: TelegramBotResponse = await processTelegramMessage({
      text: messageText,
      callbackData,
      fromName,
      hasPhoto,
      hasDocument,
      caption
    });

    if (callbackQueryId) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQueryId })
        });
      } catch (err) {
        console.warn('answerCallbackQuery error:', err);
      }
    }

    // Send Message
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: botResponse.text,
        parse_mode: botResponse.parse_mode || 'Markdown',
        reply_markup: botResponse.reply_markup
      })
    });
  } catch (error) {
    console.error('[Telegram Engine] Error handling update:', error);
  }
}

async function startTelegramPolling(token: string) {
  if (isPollingActive) {
    console.log('[Telegram Polling] Polling already active, restarting with new token...');
    stopTelegramPolling();
  }

  if (!token) return;

  isPollingActive = true;
  pollingAbortController = new AbortController();

  console.log('[Telegram Polling] Starting polling loop for bot token...');

  // 1. Fetch Bot Info
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();
    if (meData.ok) {
      currentBotInfo = meData.result;
      console.log(`[Telegram Polling] Connected as @${currentBotInfo.username} (${currentBotInfo.first_name})`);
    }
  } catch (e) {
    console.warn('[Telegram Polling] getMe failed:', e);
  }

  // 2. Remove any existing webhook so getUpdates works
  try {
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
  } catch (e) {
    console.warn('[Telegram Polling] deleteWebhook failed:', e);
  }

  let offset = 0;

  // 3. Polling loop
  (async () => {
    while (isPollingActive) {
      try {
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20`;
        const res = await fetch(url, { signal: pollingAbortController?.signal });
        
        if (!res.ok) {
          console.warn(`[Telegram Polling] HTTP ${res.status}, waiting 3s...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }

        const data: any = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            // Handle update asynchronously
            handleTelegramUpdate(update, token);
          }
        } else {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || !isPollingActive) {
          break;
        }
        console.warn('[Telegram Polling] Loop error (will retry in 3s):', err.message);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    console.log('[Telegram Polling] Polling loop ended.');
  })();
}

function stopTelegramPolling() {
  isPollingActive = false;
  if (pollingAbortController) {
    pollingAbortController.abort();
    pollingAbortController = null;
  }
}

// Auto-start polling if token is present in environment
if (activeTelegramToken) {
  startTelegramPolling(activeTelegramToken);
}

// ======================= API ROUTES =======================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    totalBanks: BANGLADESH_BANKS.length,
    telegramConfigured: Boolean(activeTelegramToken),
    isPollingActive,
    bot: currentBotInfo
  });
});

// 2. Get all banks
app.get('/api/banks', (req, res) => {
  const { category, isIslamic, search } = req.query;
  let results = [...BANGLADESH_BANKS];

  if (category && category !== 'all') {
    results = results.filter(b => b.category === category);
  }

  if (isIslamic === 'true') {
    results = results.filter(b => b.isIslamic);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter(b => 
      b.nameBn.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.shortCode.toLowerCase().includes(q) ||
      b.routingNumber.includes(q) ||
      b.swiftCode.toLowerCase().includes(q) ||
      b.helplineShort.includes(q)
    );
  }

  res.json({
    total: results.length,
    banks: results
  });
});

// 3. Get single bank by ID
app.get('/api/banks/:id', (req, res) => {
  const bank = BANGLADESH_BANKS.find(b => b.id === req.params.id);
  if (!bank) {
    return res.status(404).json({ error: 'Bank not found' });
  }
  res.json(bank);
});

// 4. Telegram Bot Simulator Endpoint (For Web UI testing)
app.post('/api/bot/simulate', async (req, res) => {
  try {
    const { text, callbackData, fromName, hasPhoto, hasDocument, caption } = req.body;
    queriesProcessedCount++;

    const response: TelegramBotResponse = await processTelegramMessage({
      text,
      callbackData,
      fromName: fromName || 'User',
      hasPhoto,
      hasDocument,
      caption
    });

    const flatButtons = response.reply_markup?.inline_keyboard
      ? response.reply_markup.inline_keyboard.flat().map(btn => ({
          text: btn.text,
          callbackData: btn.callback_data,
          url: btn.url
        }))
      : [];

    res.json({
      text: response.text,
      buttons: flatButtons,
      parseMode: response.parse_mode || 'Markdown',
      ticketCreated: response.ticketCreated
    });
  } catch (error: any) {
    console.error('Simulator error:', error);
    res.status(500).json({ error: error.message || 'Error processing simulator message' });
  }
});

// 4.1 Support Tickets Endpoints
app.get('/api/tickets', (req, res) => {
  res.json({
    total: SUPPORT_TICKETS_STORE.length,
    tickets: SUPPORT_TICKETS_STORE
  });
});

app.post('/api/tickets', (req, res) => {
  const { userName, userContact, type, summary, imageUrl } = req.body;
  const newTicket = createSupportTicket({
    userName,
    userContact,
    type: type || 'general_inquiry',
    summary: summary || 'নতুন কাস্টমার সহায়তা অনুরোধ',
    imageUrl
  });
  res.status(201).json(newTicket);
});

app.patch('/api/tickets/:id', (req, res) => {
  const { status, agentNotes } = req.body;
  const ticket = SUPPORT_TICKETS_STORE.find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (status) ticket.status = status;
  if (agentNotes !== undefined) ticket.agentNotes = agentNotes;
  ticket.updatedAt = new Date().toISOString();

  res.json(ticket);
});


// 5. Telegram Webhook Endpoint
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    const botToken = activeTelegramToken || process.env.TELEGRAM_BOT_TOKEN;

    if (botToken) {
      await handleTelegramUpdate(update, botToken);
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(200).send('Error processed');
  }
});

// 6. Connect Telegram Bot Token (Connects live bot & starts long polling)
app.post('/api/telegram/connect', async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== 'string' || !token.includes(':')) {
    return res.status(400).json({
      ok: false,
      error: 'সঠিক Telegram Bot Token দিন (যেমন: 123456789:ABCdefGhIJKlmNoPQ...)'
    });
  }

  const cleanToken = token.trim();

  try {
    const meRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const meData = await meRes.json();

    if (!meData.ok) {
      return res.status(400).json({
        ok: false,
        error: meData.description || 'টেলিগ্রাম টোকেনটি সঠিক নয়। অনুগ্রহ করে BotFather থেকে পুনরায় কপি করুন।'
      });
    }

    activeTelegramToken = cleanToken;
    currentBotInfo = meData.result;

    // Start long-polling
    startTelegramPolling(cleanToken);

    res.json({
      ok: true,
      message: `বট সফলভাবে সংযুক্ত হয়েছে! @${currentBotInfo.username} এখন সক্রিয়।`,
      bot: currentBotInfo,
      polling: true
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 7. Disconnect Telegram Bot
app.post('/api/telegram/disconnect', (req, res) => {
  stopTelegramPolling();
  activeTelegramToken = '';
  currentBotInfo = null;
  res.json({ ok: true, message: 'টেলিগ্রাম বটের সংযোগ বিচ্ছিন্ন করা হয়েছে।' });
});

// 8. Telegram Bot Status Helper
app.get('/api/telegram/status', async (req, res) => {
  const botToken = activeTelegramToken || process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.APP_URL || '';

  if (!botToken) {
    return res.json({
      configured: false,
      message: 'টেলিগ্রাম বট টোকেন এখনো সংযুক্ত করা হয়নি।',
      isPollingActive: false,
      appUrl,
      webhookUrl: `${appUrl}/api/telegram-webhook`
    });
  }

  try {
    let botInfo = currentBotInfo;
    if (!botInfo) {
      const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const meData = await meRes.json();
      botInfo = meData.result || null;
      currentBotInfo = botInfo;
    }

    res.json({
      configured: true,
      bot: botInfo,
      isPollingActive,
      appUrl,
      expectedWebhookUrl: `${appUrl}/api/telegram-webhook`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, configured: false });
  }
});

// 9. Set Webhook Endpoint (For users wanting Webhook instead of Polling)
app.post('/api/telegram/set-webhook', async (req, res) => {
  const botToken = req.body.token || activeTelegramToken || process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = req.body.appUrl || process.env.APP_URL;

  if (!botToken) {
    return res.status(400).json({ error: 'Telegram Bot Token is required' });
  }

  if (!appUrl) {
    return res.status(400).json({ error: 'APP_URL is required to configure Webhook' });
  }

  const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram-webhook`;

  try {
    // Stop polling if switching to webhook
    stopTelegramPolling();

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true
      })
    });
    const result = await tgRes.json();
    activeTelegramToken = botToken;
    res.json({ success: result.ok, result, webhookUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    totalBanks: BANGLADESH_BANKS.length,
    activeWebhooks: isPollingActive ? 0 : 1,
    isPollingActive,
    queriesProcessed: queriesProcessedCount,
    supportedTransferBanks: BANGLADESH_BANKS.filter(b => b.bKashTransfer.npsbTransfer).length,
    serverUptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    botConfigured: Boolean(activeTelegramToken),
    bot: currentBotInfo
  });
});

// ======================= VITE / STATIC MIDDLEWARE =======================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telegram Bot Server running on http://localhost:${PORT}`);
  });
}

startServer();

