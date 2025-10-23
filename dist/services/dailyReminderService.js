"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyReminderService = void 0;
const apifyService_1 = require("./apifyService");
const telegramService_1 = require("./telegramService");
const llmCategorizationService_1 = require("./llmCategorizationService");
const eventDeduplicator_1 = require("../utils/eventDeduplicator");
const eventFilter_1 = require("../utils/eventFilter");
const config_1 = require("../config/config");
class DailyReminderService {
    constructor() {
        this.apifyService = new apifyService_1.ApifyService();
        this.telegramService = new telegramService_1.TelegramService();
        this.llmCategorizationService = new llmCategorizationService_1.LLMCategorizationService();
    }
    async sendTodaysEvents() {
        try {
            console.log('📅 Starting daily events reminder...');
            for (const cityConfig of config_1.config.cities) {
                const { cityName, country, chatId } = cityConfig;
                console.log(`\n🌅 Processing today's events for ${cityName}, ${country}...`);
                // Fetch events from Meetup
                const meetupEvents = await this.apifyService.fetchMeetupEvents(cityName, country);
                console.log(`📊 Found ${meetupEvents.length} AI-related events for ${cityName}`);
                // Filter for today's events only
                const todaysEvents = this.filterTodaysEvents(meetupEvents);
                console.log(`📅 Found ${todaysEvents.length} events happening today in ${cityName}`);
                if (todaysEvents.length === 0) {
                    // Skip sending message when no events found
                    continue;
                }
                // Process and categorize today's events
                const processedEvents = eventFilter_1.EventFilter.processEvents(todaysEvents);
                const categorizedEvents = await this.llmCategorizationService.categorizeEventsBatch(processedEvents);
                const deduplicatedEvents = eventDeduplicator_1.EventDeduplicator.deduplicateEvents(categorizedEvents);
                const sortedEvents = deduplicatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                // Send today's events
                await this.sendTodaysEventsMessage(sortedEvents, cityName, chatId);
                console.log(`✅ Successfully sent today's events for ${cityName}`);
                // Small delay between cities
                if (config_1.config.cities.indexOf(cityConfig) < config_1.config.cities.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        catch (error) {
            console.error('❌ Error sending daily reminder:', error);
            throw error;
        }
    }
    filterTodaysEvents(events) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= todayStart && eventDate < todayEnd;
        });
    }
    async sendNoEventsMessage(cityName, chatId) {
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = today.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        const message = `📅 **${dayName}, ${dateStr}** - No AI events scheduled for today.

💡 Perfect day to:
• 🔍 Explore AI tools and resources
• 📚 Catch up on AI research and articles  
• 🤝 Connect with the AI community online
• 🛠️ Work on your AI projects

Check back tomorrow for more events! 🚀`;
        await this.telegramService.sendMessage(message, chatId);
    }
    async sendTodaysEventsMessage(events, cityName, chatId) {
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = today.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        let message = `🎯 **${events.length} AI event${events.length > 1 ? 's' : ''} happening TODAY** - ${dayName}, ${dateStr}:

`;
        events.forEach(event => {
            const eventTime = new Date(event.date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false
            });
            const categoryEmoji = this.getCategoryEmoji(event.category);
            const cleanTitle = this.cleanEventTitle(event.title);
            message += `⏰ **${eventTime}** - ${this.escapeMarkdown(cleanTitle)}\n`;
            message += `${categoryEmoji} ${event.category} • [Join Event](${event.url})\n\n`;
        });
        message += `Have a great day building the future! 🚀🤖`;
        await this.telegramService.sendMessage(message, chatId);
    }
    getCategoryEmoji(category) {
        const categoryEmojis = {
            AI: '🤖',
            Product: '📦',
            Engineering: '⚡',
            Business: '💼',
            UX: '🎨',
            Lifestyle: '🏃',
            Other: '📌'
        };
        return categoryEmojis[category] || '📌';
    }
    cleanEventTitle(title) {
        return title.replace(/\[[^\]]*\]/g, '').trim();
    }
    escapeMarkdown(text) {
        return text.replace(/[_*[\]`]/g, '\\$&');
    }
}
exports.DailyReminderService = DailyReminderService;
//# sourceMappingURL=dailyReminderService.js.map