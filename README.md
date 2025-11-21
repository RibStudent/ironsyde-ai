# IronSyde - AI-Powered NSFW Avatar Platform

**IronSyde** is a comprehensive NSFW AI avatar platform designed specifically for adult content creators. Generate photorealistic AI avatars, engage in voice conversations with emotional intelligence, create talking videos, and automate OnlyFans fan engagement.

![IronSyde Platform](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-Private-red)

## 🌟 Features

### 🎨 Multi-Model AI Avatar Generation
- **SeeDream-4** - Ultra-photorealistic avatar generation (default)
- **Flux Dev & Schnell** - High-quality and fast generation options
- **Stable Diffusion XL** - Reliable photorealistic results
- **Qwen Image Edit** - Advanced photo editing capabilities
- **Image-to-Image** - Transform reference photos with style presets
- **10 Style Presets** - Instagram Model, Anime, Boudoir, Fashion Editorial, and more

### 💬 Interactive AI Chat System
- **Personality-Based Conversations** - Powered by Google Gemini AI
- **NSFW Photo Generation** - On-demand avatar photos in chat (Standard+ tier)
- **Conversation History** - Full message tracking and context retention
- **Multiple Personalities** - Seductive, playful, professional, sweet, dominant

### 🎙️ Voice Chat with Hume EVI
- **Empathic Voice Interface** - Real-time emotional intelligence
- **Natural Turn-Taking** - Interrupt and respond naturally
- **Emotional Awareness** - Avatars understand your tone and emotion
- **WebSocket-Based** - Low-latency voice conversations

### 🎥 HeyGen Video Avatars
- **Talking Videos** - Generate lip-synced avatar videos
- **Realistic Movements** - Natural expressions and gestures
- **Seamless Integration** - Video responses in chat interface

### 🔗 OnlyFans Integration
- **Chrome Extension** - Semi-automated messaging assistant
- **AI Message Suggestions** - Context-aware response recommendations
- **Content Generation** - Automated NSFW photo delivery
- **Analytics Dashboard** - Track engagement and revenue

### 💳 Subscription Tiers
- **Free** - Basic avatar generation
- **Standard ($36/month)** - NSFW photo generation in chat
- **Premium** - Voice chat + video avatars + all features

### 🎯 Credit System
- 12,000 credits per user
- Usage tracking and history
- Generation cost transparency

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Fast build tooling
- **TailwindCSS 4** - Modern styling
- **Wouter** - Lightweight routing
- **shadcn/ui** - Beautiful UI components
- **tRPC** - End-to-end typesafe APIs

### Backend
- **Node.js** with Express
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Database management
- **PostgreSQL** (Neon) - Primary database
- **AWS S3** - File storage

### AI Services
- **Replicate API** - Multi-model image generation
  - SeeDream-4, Flux Dev/Schnell, SDXL, Qwen
- **Google Gemini** - Personality-based chat, prompt enhancement
- **Hume AI** - Empathic voice interface (EVI)
- **HeyGen** - Talking video avatars with lip-sync

### Authentication
- **OAuth** via Manus platform
- **JWT** session management

## 📁 Project Structure

```
botly-replica/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities and tRPC client
│   └── public/            # Static assets
├── server/                 # Node.js backend
│   ├── routers/           # tRPC API routers
│   ├── db.ts              # Database queries
│   └── storage.ts         # S3 file storage
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
├── chrome-extension/      # OnlyFans Chrome extension
└── tests/                 # Test files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL database (Neon recommended)
- API Keys:
  - Replicate API
  - Google Gemini API
  - Hume AI (API Key + Secret)
  - HeyGen API (via MCP)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RibStudent/ironsyde-ai.git
cd ironsyde-ai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys and database URL
```

4. **Push database schema**
```bash
pnpm db:push
```

5. **Start development server**
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev

# AI Services
REPLICATE_API_TOKEN=r8_your_replicate_token
GEMINI_API_KEY=your_gemini_api_key
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key

# App Configuration
VITE_APP_TITLE="IronSyde"
VITE_APP_LOGO="https://your-logo-url.com/logo.png"
PORT=3000
```

## 📦 Database Schema

### Core Tables
- **users** - User accounts and authentication
- **avatars** - Generated avatar metadata
- **conversations** - Chat conversations
- **messages** - Chat messages with AI responses
- **voice_calls** - Voice chat session tracking
- **onlyfans_accounts** - OnlyFans account connections
- **personality_profiles** - Avatar personality configurations

## 🎨 Key Features Implementation

### Avatar Generation
```typescript
// Generate avatar with SeeDream-4
const avatar = await trpc.avatar.generate.mutate({
  prompt: "professional photoshoot, beautiful model",
  model: "seedream-4",
  width: 1024,
  height: 1024,
});
```

### Voice Chat with Hume EVI
```typescript
// Start voice conversation
const { connect } = useVoice();
await connect({
  auth: { type: "accessToken", value: accessToken },
  configId: "your-evi-config-id",
});
```

### Chat with AI
```typescript
// Send message and get AI response
const response = await trpc.chat.sendMessage.mutate({
  conversationId: "conv_123",
  content: "Hello!",
});
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/evi.test.ts
```

## 📱 Chrome Extension

The OnlyFans Chrome extension provides semi-automated messaging assistance:

1. Navigate to `chrome-extension/` directory
2. Load unpacked extension in Chrome
3. Visit OnlyFans and the extension will activate
4. Get AI-powered message suggestions
5. One-click response sending

## 🔒 Security & Compliance

- **NSFW Content Controls** - Age verification and content moderation
- **API Key Security** - Server-side only, never exposed to client
- **Rate Limiting** - Prevents abuse and spam detection
- **OAuth Authentication** - Secure user authentication
- **Data Encryption** - All sensitive data encrypted at rest

## 🎯 Roadmap

- [ ] LiveKit voice agent integration for phone calls
- [ ] Personality builder UI for custom avatar personalities
- [ ] Advanced OnlyFans analytics dashboard
- [ ] Stripe payment integration for credit purchases
- [ ] Multi-language support for international creators
- [ ] Mobile app (React Native)

## 📄 License

This project is private and proprietary. All rights reserved.

## 👤 Author

**Rhys T (RibStudent)**
- GitHub: [@RibStudent](https://github.com/RibStudent)

## 🙏 Acknowledgments

- Built for **Karlee Ironside** and adult content creators
- Powered by cutting-edge AI technologies
- Baby pink branding theme 💗

---

**Note:** This platform is designed for adult content creation and should be used responsibly and in compliance with all applicable laws and platform terms of service.

