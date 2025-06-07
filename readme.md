

# Rai WhatsApp AI Bot

A WhatsApp bot powered by **Baileys** + **Google Gemini API**, built in **Node.js**.

The bot connects to your WhatsApp account, listens for incoming messages, and responds automatically using **Gemini AI**. It acts as a polite AI assistant named "Rai".

---

## Features

* WhatsApp Web connection via **@whiskeysockets/baileys**.
* Automatically responds to messages with Gemini AI.
* Polite, friendly personality (customizable via system prompt).
* Handles reconnection and QR code login flow.
* Supports multi-session auth state (QR code shown only on first run or logout).
* Basic error handling and retry logic.

---

## Tech Stack

* Node.js
* @whiskeysockets/baileys — WhatsApp Web client library.
* Google Gemini API — LLM used to generate AI responses.
* qrcode-terminal — Display QR code in terminal.
* dotenv — Load environment variables.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/rai-whatsapp-bot.git
cd rai-whatsapp-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

You can obtain an API key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Running the Bot

```bash
node index.js
```

On first run, you will see a QR code.
Scan the QR code with your WhatsApp app to connect the bot.

---

## Usage

* Send a message to the WhatsApp account connected to the bot.
* The bot will reply automatically using Gemini AI.
* If the bot is disconnected or logged out, it will auto-reconnect or prompt for a new QR scan.

---

## Behavior and Personality

The bot acts as an assistant named **Rai**.
It will:

* Always answer politely.
* Explain programming concepts clearly.
* Respond only in English.
* Refuse to answer political, educational, or personal questions.
* Say "I'm not sure about that." when it doesn't know the answer.

The system prompt is configurable inside the `index.js` file:

```js
const SYSTEM_PROMPT = `
You are an AI assistant named Rai.
... (see code for full prompt)
`;
```

---

## Troubleshooting

### Re-login / QR code expired

If you encounter:

```
401 Unauthorized — deleting auth_info and restarting for new QR scan...
```

Just scan the new QR code shown in the terminal.

You can also manually delete the `auth_info/` folder to force a new login.

---

## Limitations

* Not optimized for group chats (you can add logic if needed).
* No persistent memory/chat history (stateless per message).
* Simple error handling (can be improved).
* Rate limiting and anti-spam not included yet.

---

## Roadmap / Future Improvements

* Add "Typing…" indicator while bot is generating a reply.
* Add memory (store recent messages per user).
* Add support for image / video captions.
* Rate limiting per sender to avoid spam.
* Deploy to server (PM2 / Docker / VPS).

---

## License

MIT License

---

## Credits

* [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
* [Google Gemini API](https://aistudio.google.com/)
* QR code display via `qrcode-terminal`.

