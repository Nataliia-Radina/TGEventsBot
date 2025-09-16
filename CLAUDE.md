# Berlin Events Telegram Bot

A TypeScript application that parses Berlin tech events for the upcoming week from Apify, categorizes them and posts them to Telegram.

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled application
- `npm run dev` - Run in development mode with hot reload
- `npm test` - Run tests (currently not implemented)

## Architecture

- **Main entry**: `src/main.ts` → `dist/main.js`
- **Services**: Event fetching from Apify and Telegram bot integration
- **Types**: Event data structures and interfaces
- **Utils**: Event filtering and categorization logic

## Dependencies

- `apify-client` - Apify platform integration
- `node-telegram-bot-api` - Telegram bot functionality
- `dotenv` - Environment variable management
- `typescript`/`tsx` - TypeScript development tools