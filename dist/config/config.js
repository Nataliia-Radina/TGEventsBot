"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    cities: [
        {
            cityName: 'berlin',
            country: 'germany',
            chatId: '-1003082209974',
        },
        {
            cityName: 'amsterdam',
            country: 'netherlands',
            chatId: '-1003062354872',
        },
        {
            cityName: 'london',
            country: 'uk',
            chatId: '-1003072628330',
        }
    ],
    apify: {
        token: process.env.APIFY_API_TOKEN || 'apify_api_CBtjQf2OW590nSRFqcZDblombCT0sz2DwJv9',
        meetupActorId: process.env.MEETUP_ACTOR_ID || 'filip_cicvarek/meetup-scraper',
        lumaActorId: process.env.LUMA_ACTOR_ID || 'luma/events-scraper',
        timeout: 300000, // 5 minutes
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '8207376858:AAHBogwGHZ3LGpdyBbw9WMZwzmTAyepJlg0',
        chatId: process.env.TELEGRAM_CHAT_ID || '1',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    defaultFilters: {
        "maxResults": 100,
        "scrapeActualAttendeesCount": true,
        "scrapeEventAddress": true,
        "scrapeEventDate": true,
        "scrapeEventDescription": true,
        "scrapeEventName": true,
        "scrapeEventType": true,
        "scrapeEventUrl": true,
        "scrapeHostedByGroup": true,
        "scrapeMaxAttendees": true,
        "eventType": "",
        "searchKeyword": "tech, software, ai, product, design, developer, javascript, php, python, ux, enterpreneurship, enterpreneur, startup",
        "state": "PHYSICAL",
    },
    daysAhead: 7,
    categories: {
        UX: ['ux', 'ui', 'user experience', 'user interface', 'design', 'designer', 'prototype', 'usability'],
        Product: ['product management', 'product manager', 'product owner', 'roadmap', 'strategy', 'product'],
        AI: ['artificial intelligence', 'machine learning', 'deep learning', 'neural', 'llm', 'llms', 'data', 'gpt', 'chatgpt', 'ai', 'ais'],
        Lifestyle: ['running', 'coffee', 'walk', 'walking', 'art', 'eat', 'lunch', 'dinner', 'swimming', 'swim', 'fitness', 'yoga', 'meditation', 'cooking', 'food', 'social', 'drinks', 'casual', 'community', 'outdoor', 'nature', 'wellness'],
        Business: ['makers', 'builders', 'investors', 'investments', 'founder', 'founders', 'business', 'entrepreneur', 'startup', 'startups', 'venture', 'investment', 'funding', 'marketing', 'sales'],
        Engineering: ['testing', 'engineering', 'software', 'developer', 'programming', 'code', 'backend', 'frontend', 'fullstack', 'tech', 'laravel', 'php', 'javascript', 'python', 'java', 'kotlin', 'typescript', 'react', 'nodejs', 'symfony', 'js', 'react'],
    }
};
function validateConfig() {
    const required = [
        exports.config.apify.token,
        exports.config.telegram.botToken,
        exports.config.openai.apiKey
    ];
    const missing = required.filter(value => !value);
    if (missing.length > 0) {
        console.error('Missing required environment variables. Please check .env file.');
        return false;
    }
    return true;
}
//# sourceMappingURL=config.js.map