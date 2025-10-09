# Amsterdam Events Telegram Bot

A TypeScript application that fetches Amsterdam tech events for the upcoming week from Meetup (via Apify), categorizes them using AI, and posts them to Telegram.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Fill in your API keys and tokens:
     - `APIFY_API_TOKEN` - Your Apify API token
     - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
     - `OPENAI_API_KEY` - Your OpenAI API key

3. **Build and Run**:
   ```bash
   npm run build
   npm run start
   ```

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled application
- `npm run dev` - Run in development mode with hot reload
- `npm test` - Run tests (currently not implemented)

## Architecture

- **Main entry**: `src/main.ts` → `dist/main.js`
- **Services**: 
  - `ApifyService` - Event fetching from Meetup via Apify
  - `TelegramService` - Telegram bot integration
  - `LLMCategorizationService` - AI-powered event categorization
- **Types**: Event data structures and interfaces
- **Utils**: Event filtering, categorization, and deduplication logic
- **Config**: Centralized configuration with validation

## Features

- **Multi-source event fetching** from Meetup
- **AI-powered categorization** using OpenAI GPT-4o-mini
- **Smart deduplication** to avoid duplicate events
- **Comprehensive error handling** and logging
- **Configurable filtering** by attendee count and date range
- **Automated scheduling** via GitHub Actions (weekly)

## Event Categories

- **AI** - Artificial intelligence, machine learning, data science
- **Product** - Product management, strategy, roadmaps
- **Engineering** - Software development, programming, technical talks
- **Business** - Startups, entrepreneurship, funding, marketing
- **UX** - User experience, design, prototyping
- **Lifestyle** - Community gatherings, wellness, social events
- **Other** - Everything else

## Dependencies

- `apify-client` - Apify platform integration
- `node-telegram-bot-api` - Telegram bot functionality
- `openai` - OpenAI API integration for event categorization
- `dotenv` - Environment variable management
- `typescript`/`tsx` - TypeScript development tools