import fetch from 'node-fetch';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const SYSTEM_PROMPT = `
You are an AI assistant named Rai .
You must always answer politely, clearly, and accurately.
If the user asks about programming, explain in simple terms with examples.
If you receive a message in a language other than English, politely say:
"I'm sorry, I can only understand and respond in English."
Do not discuss politics, education, or personal topics like girlfriends.
If you do not know the answer, say "I'm not sure about that."
Provide only helpful and respectful responses as Rai Nasir.
`;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('Scan the QR code above with WhatsApp to authenticate.');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;

      console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', !isLoggedOut);

      if (statusCode === 401) {
        console.log('401 Unauthorized — deleting auth_info and restarting for new QR scan...');
        try {
          await fs.rm('auth_info', { recursive: true, force: true });
          console.log('auth_info folder deleted successfully.');
        } catch (err) {
          console.error('Error deleting auth_info folder:', err);
        }
        startBot();
        return;
      }

      if (!isLoggedOut) {
        console.log('Attempting to reconnect...');
        startBot();
      } else {
        console.log('Logged out — please delete auth_info folder and restart the bot manually.');
      }
    } else if (connection === 'open') {
      console.log('WhatsApp connected!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const userText = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!userText) return;

    console.log(`Message from ${sender}: ${userText}`);
    console.log('Sending prompt to Gemini API...');

    try {
      const combinedPrompt = SYSTEM_PROMPT + "\n\nUser: " + userText;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: combinedPrompt }
            ]
          }
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!reply) throw new Error('No valid response from Gemini API');

      console.log(`Gemini reply: ${reply}`);

      await sock.sendMessage(sender, { text: reply });
    } catch (error) {
      console.error('Error with Gemini API:', error.message);
      await sock.sendMessage(sender, { text: 'Sorry, there was an error processing your request.' });
    }
  });
}

startBot();
