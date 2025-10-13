# Amsterdam Events Telegram Bot

A TypeScript bot that fetches AI-related events from Meetup and posts them to a Telegram channel with daily scheduling support.

## Features

- Fetches events from Meetup using Apify scrapers
- Filters for AI/ML/tech related events using smart keyword matching
- Categorizes events using OpenAI (AI, Engineering, UX, Business, Lifestyle, Other)
- Posts formatted messages to Telegram with clean formatting
- Deduplicates similar events
- **Daily scheduler** - runs automatically at 9:00 AM Amsterdam time
- Configurable for multiple cities

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
export APIFY_API_TOKEN="your_apify_token"
export TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
export OPENAI_API_KEY="your_openai_api_key"
```

3. Build the project:
```bash
npm run build
```

## Usage

### Run Once
```bash
npm run start
```

### Daily Scheduler (9:00 AM Amsterdam time)
```bash
npm run schedule
```

### Test Scheduler (runs every minute for testing)
```bash
npm run schedule:test
```

### Development Mode
```bash
npm run dev
```

## Scheduler Features

- **Daily execution** at 9:00 AM Amsterdam time
- **Timezone aware** - automatically handles daylight saving time
- **Error handling** - continues running even if individual runs fail
- **Graceful shutdown** - Press Ctrl+C to stop
- **Test mode** - Run every minute for testing

## Configuration

Edit `src/config/config.ts` to:
- Add more cities
- Adjust event filters (currently 14 days ahead)
- Modify AI-related search keywords
- Change minimum attendee requirements
- Update Telegram chat IDs

## Event Categories

Events are automatically categorized into:
- 🤖 **AI** - Core AI/ML topics, research, protocols
- ⚡ **Engineering** - Technical talks, programming languages, infrastructure
- 🎨 **UX** - Design, AI-assisted design, creative tools
- 💼 **Business** - Startups, strategy, funding
- 🏃 **Lifestyle** - Networking, community events, discussions
- 📌 **Other** - Events that don't fit other categories

## Example Output

```
🤖 Amsterdam AI Events Oct 13 - Oct 27

📅 Oct 14 — AI Native in Action: Agent Symphony, AI Co-Authors & A Special Book Signing!
⏰ 17:45 • 🤖 AI
🔗 https://www.meetup.com/ai-native-amsterdam/events/311066899/

📅 Oct 15 — UX Workshop: Let's play with AI prototyping
⏰ 18:00 • 🎨 UX
🔗 https://www.meetup.com/amsterdamux/events/311199351/

📅 Oct 16 — AmsterdamPHP Monthly Meeting
⏰ 19:00 • ⚡ Engineering
🔗 https://www.meetup.com/amsterdamphp/events/307345084/
```
