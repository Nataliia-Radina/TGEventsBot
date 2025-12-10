import dotenv from 'dotenv';

dotenv.config();

export const config = {
  cities: [
    {
      cityName: 'amsterdam',
      country: 'netherlands',
      chatId: '-1003036770271',
    }
  ],
  apify: {
    token: process.env.APIFY_API_TOKEN,
    meetupActorId: process.env.MEETUP_ACTOR_ID || 'filip_cicvarek/meetup-scraper',
    lumaActorId: process.env.LUMA_ACTOR_ID || 'lexis-solutions/lu-ma-scraper',
    timeout: 300000, // 5 minutes
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  linkedin: {
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    authorUrn: process.env.LINKEDIN_AUTHOR_URN,
    apiVersion: process.env.LINKEDIN_API_VERSION || '202412',
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
    "searchKeyword": "artificial intelligence, machine learning, AI, deep learning, neural networks, LLM, GPT, ChatGPT, OpenAI, generative AI, AI art, AI tools, AI startup, AI product, data science, computer vision, NLP, prompt engineering",
    "state": "PHYSICAL",
  },
  daysAhead: 7,
  minAttendees: 5,
  delays: {
    betweenCity: 2000, // 2 seconds
    betweenLlmBatches: 1000, // 1 second
  },
  llm: {
    batchSize: 5,
    maxTokens: 10,
    temperature: 0,
    maxDescriptionLength: 500,
  },
  categories: {
    UX: ['ux', 'ui', 'user experience', 'user interface', 'design', 'designer', 'prototype', 'usability'],
    Product: ['product management', 'product manager', 'product owner', 'roadmap', 'strategy', 'product'],
    AI: ['artificial intelligence', 'machine learning', 'deep learning', 'neural', 'llm', 'llms', 'data', 'gpt', 'chatgpt', 'ai', 'ais'],
    Lifestyle: ['running', 'coffee', 'walk', ' walking', 'art', 'eat', 'lunch', 'dinner', 'swimming', 'swim', 'fitness', 'yoga', 'meditation', 'cooking', 'food', 'social', 'drinks', 'casual', 'community', 'outdoor', 'nature', 'wellness'],
    Networking: ['networking', 'tech drinks', 'startup drinks', 'developer drinks', 'tech social', 'tech meetup', 'socialising', 'social', 'drinks', 'mixer', 'tech networking', 'startup networking', 'developer networking', 'community', 'connect', 'meet', 'gathering', 'pitch', 'pitching', 'startup pitch', 'pitch event', 'demo day', 'pitch competition'],
    Business: ['makers', 'builders', 'investors', 'investments', 'founder', 'founders', 'business', 'entrepreneur', 'startup', 'startups', 'venture', 'investment', 'funding', 'marketing', 'sales'],
    Engineering: ['testing', 'engineering', 'software', 'developer', 'programming', 'code', 'backend', 'frontend', 'fullstack', 'tech', 'laravel', 'php', 'javascript', 'python', 'java', 'kotlin', 'typescript', 'react', 'nodejs', 'symfony', 'js','react'],
  }
};

export function validateConfig(): boolean {
  const requiredEnvVars = [
    { name: 'APIFY_API_TOKEN', value: config.apify.token },
    { name: 'TELEGRAM_BOT_TOKEN', value: config.telegram.botToken },
    { name: 'OPENAI_API_KEY', value: config.openai.apiKey }
  ];

  const missing = requiredEnvVars.filter(env => !env.value);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(env => {
      console.error(`   - ${env.name}`);
    });
    console.error('\nPlease create a .env file with the required variables.');
    return false;
  }

  // Validate token formats - Telegram bot tokens contain bot_id:token
  if (config.telegram.botToken && !config.telegram.botToken.includes(':')) {
    console.error('❌ Invalid Telegram bot token format. Expected format: <bot_id>:<token>')
    return false;
  }

  if (config.openai.apiKey && !config.openai.apiKey.startsWith('sk-')) {
    console.error('❌ Invalid OpenAI API key format');
    return false;
  }

  console.log('✅ Configuration validation passed');
  return true;
}