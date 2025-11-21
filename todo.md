# Botly Replica - TODO

## Core Features

- [x] Set up dark theme configuration
- [x] Create hero section with gradient headline
- [x] Add top banner with announcement
- [x] Build navigation header with logo and links
- [x] Implement statistics section (10K+ creators, 8M+ chats)
- [x] Create expandable features section with 3 features
- [x] Build pricing section with monthly/annual toggle
- [x] Add testimonials section with 3 creator testimonials
- [x] Create final CTA section
- [x] Implement FAQ accordion section
- [x] Build footer with links and legal info
- [x] Add smooth scroll to anchor links
- [x] Ensure mobile-responsive design
- [x] Add mobile phone mockup images
- [x] Add desktop mockup image
- [x] Implement gradient text effects
- [x] Style buttons with purple gradient
- [x] Add hover effects and animations



## Rebranding Updates

- [ ] Change brand name to IronSide-inspired name
- [ ] Update color scheme to baby pink
- [ ] Update logo and branding elements
- [ ] Update all gradient colors to pink tones
- [ ] Update button colors to pink
- [ ] Update accent colors throughout the site



## Backend & Avatar Generation Features

- [x] Upgrade project to web-db-user (backend + database + authentication)
- [x] Create database schema for avatars
- [x] Set up user authentication system
- [x] Integrate NSFW-capable AI image generation API (Replicate with Flux/SDXL)
- [x] Create avatar generation endpoint
- [x] Build avatar gallery/management page
- [x] Add avatar creation form/interface
- [x] Implement avatar storage (S3)
- [x] Create user dashboard to view generated avatars
- [x] Add avatar download functionality
- [ ] Implement avatar editing/regeneration
- [x] Add usage tracking and credits system
- [x] Implement NSFW content generation with safety controls
- [ ] Add content moderation and legal compliance features
- [x] Create API endpoints for avatar CRUD operations



## Homepage Updates

- [x] Add Karlee's photo to hero section

## New Features

- [x] Implement image-to-image generation backend
- [x] Add image upload functionality to generation form
- [x] Update Replicate integration to support image input
- [x] Create style presets/templates system
- [x] Add preset selector to generation UI
- [x] Create preset templates (Instagram Model, Anime Character, Professional Headshot, etc.)



## Bug Fixes

- [x] Fix missing getLoginUrl import in Home.tsx



## User Profile Page

- [x] Create profile page component
- [x] Display user account information
- [x] Show credit balance and usage statistics
- [x] Add generation history with statistics
- [x] Implement profile navigation in header
- [x] Add route for profile page



## Bug Fixes

- [x] Fix login button not working on homepage



## Social Sharing Feature

- [ ] Add social sharing buttons to gallery items
- [ ] Implement Twitter/X share functionality
- [ ] Implement Facebook share functionality
- [ ] Implement Reddit share functionality
- [ ] Implement copy link to clipboard functionality
- [ ] Add share dialog/modal component



## Critical Bugs

- [ ] Fix white screen when clicking login button



## Testing

- [x] Test image generation with Replicate API



## Fixes and Improvements

- [ ] Fix missing authorization header for publishing
- [x] Switch to Stable Diffusion XL (SDXL) for more realistic images
- [x] Test SDXL generation quality



## Critical Fixes

- [x] Fix imageUrl2 initialization error in replicate.ts
- [x] Switch to SeeDream-4 model for more realistic generation
- [x] Test SeeDream-4 model



## Interactive Avatar Chat System

### Subscription Tiers
- [x] Define subscription tiers (Free, Standard, Premium)
- [x] Create subscription database schema
- [x] Implement tier-based feature access control

### Chat System
- [x] Create chat database schema (conversations, messages)
- [x] Build avatar selection and chat initiation flow
- [x] Implement AI chatbot integration (Manus Forge API)
- [x] Create chat UI with message history
- [x] Add avatar personality/character system
- [x] Store conversation context and history

### NSFW Photo Generation
- [x] Add NSFW photo request feature (Standard+ tier)
- [x] Implement on-demand avatar photo generation in chat
- [x] Add content filtering and safety controls
- [x] Track photo generation usage per tier

### Twilio Voice Chat (Premium Tier)
- [ ] Integrate Twilio API for voice calls
- [ ] Implement text-to-speech for avatar responses
- [ ] Add speech-to-text for user input
- [ ] Create voice chat UI controls
- [ ] Handle call management and billing

### UI/UX
- [ ] Add "Chat with Avatar" button on avatar cards
- [ ] Create chat interface page
- [ ] Add subscription upgrade prompts
- [ ] Display tier-based feature locks



## Deployment
- [ ] Push project to GitHub repository



## Multi-Model AI Support

- [x] Add Qwen model for photo editing
- [x] Add Flux models for high-quality generation
- [x] Add SDXL for photorealistic generation
- [x] Keep SeeDream-4 as default
- [x] Create model selection UI in generation page
- [x] Add model descriptions and use cases
- [x] Update backend to support multiple model endpoints
- [x] Add model-specific parameter handling
- [x] Test each model for quality and performance



## OnlyFans Chrome Extension (Semi-Automated)

- [x] Create Chrome extension manifest
- [x] Build content script to detect OnlyFans messages
- [x] Create AI response suggestion UI overlay
- [x] Implement one-click response sending
- [x] Add content generation button integration
- [x] Build extension popup dashboard
- [x] Add message history sync with IronSyde
- [x] Implement analytics tracking
- [x] Package extension for distribution

## Hume AI Voice Chat Integration

- [x] Add Hume API credentials to secrets
- [x] Install Hume SDK (via MCP)
- [x] Create voice chat interface component
- [x] Implement text-to-speech with avatar personality
- [x] Add speech-to-text for user input
- [x] Build real-time voice conversation system
- [x] Integrate with existing avatar chat
- [x] Add voice call recording and playback
- [x] Implement premium tier voice chat access

## OnlyFans Integration (Backend)

### Account Connection
- [x] Create OnlyFans account connection database schema
- [ ] Build OnlyFans account linking UI
- [ ] Implement extension authentication with IronSyde
- [ ] Add account status monitoring

### Message Monitoring
- [ ] Build message polling system to check for new DMs
- [ ] Parse incoming messages and extract content
- [ ] Detect message types (text, media requests, tips)
- [ ] Store conversation history in database
- [ ] Implement real-time notification system

### Auto-Response System
- [ ] Integrate AI chatbot with OnlyFans messages
- [ ] Implement personality-based responses
- [ ] Detect content requests (photos, videos, custom content)
- [ ] Auto-generate and send NSFW photos on request
- [ ] Handle payment/tip requests
- [ ] Implement conversation context tracking

### Content Delivery
- [ ] Auto-generate requested content using AI models
- [ ] Upload generated content to OnlyFans
- [ ] Send PPV (pay-per-view) content with pricing
- [ ] Track content delivery and payments

### Analytics Dashboard
- [ ] Create OnlyFans analytics page
- [ ] Display message volume and response rates
- [ ] Track revenue per conversation
- [ ] Show subscriber engagement metrics
- [ ] Display top-earning conversations
- [ ] Implement conversation filtering and search

### Conversation Management
- [ ] Build conversation inbox UI
- [ ] Implement manual takeover for complex conversations
- [ ] Add conversation flagging system
- [ ] Create response templates
- [ ] Implement bulk actions (archive, delete, prioritize)

### Safety & Compliance
- [ ] Implement content moderation filters
- [ ] Add age verification checks
- [ ] Create terms of service acceptance
- [ ] Implement rate limiting to avoid spam detection
- [ ] Add manual review queue for sensitive requests

