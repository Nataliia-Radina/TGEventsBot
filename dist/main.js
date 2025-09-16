"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apifyService_1 = require("./services/apifyService");
const telegramService_1 = require("./services/telegramService");
const eventFilter_1 = require("./utils/eventFilter");
const eventCategorizer_1 = require("./utils/eventCategorizer");
const config_1 = require("./config/config");
const eventDeduplicator_1 = require("./utils/eventDeduplicator");
class EventsBot {
    constructor() {
        this.apifyService = new apifyService_1.ApifyService();
        this.telegramService = new telegramService_1.TelegramService();
    }
    async run() {
        try {
            console.log('🚀 Starting Events Bot...');
            // Validate configuration
            if (!(0, config_1.validateConfig)()) {
                console.error('❌ Configuration validation failed. Exiting...');
                process.exit(1);
            }
            // Iterate through all configured cities
            for (const cityConfig of config_1.config.cities) {
                const { cityName, country, chatId } = cityConfig;
                console.log(`\n🚀 Processing ${cityName}, ${country}...`);
                // Fetch events from multiple sources for this city
                const [meetupEvents, lumaEvents] = await Promise.all([
                    this.apifyService.fetchMeetupEvents(cityName, country),
                    () => ([]) /*this.apifyService.fetchLumaEvents(cityName, country)*/
                ]);
                console.log(`📊 Fetched ${meetupEvents.length} Meetup events and ${lumaEvents.length} Luma events for ${cityName}`);
                // Combine all events
                // @ts-ignore
                const allEvents = [...meetupEvents]; //, ...lumaEvents];
                if (allEvents.length === 0) {
                    console.log(`⚠️  No events fetched from sources for ${cityName}`);
                    await this.telegramService.postEvents([], chatId, cityName);
                    continue;
                }
                // Filter events
                const next7DaysEvents = eventFilter_1.EventFilter.filterNext7Days(allEvents);
                console.log(`🔍 Filtered to ${next7DaysEvents.length} ${cityName} events for next 7 days`);
                // Process and categorize events
                const processedEvents = eventFilter_1.EventFilter.processEvents(next7DaysEvents);
                const categorizedEvents = await eventCategorizer_1.EventCategorizer.categorizeEvents(processedEvents);
                const deduplicatedEvents = eventDeduplicator_1.EventDeduplicator.deduplicateEvents(categorizedEvents);
                const sortedEvents = deduplicatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                console.log(`🔄 Deduplicated from ${categorizedEvents.length} to ${deduplicatedEvents.length} events for ${cityName}`);
                // Post to Telegram
                await this.telegramService.postEvents(sortedEvents, chatId, cityName);
                console.log(`✅ Successfully posted ${cityName} events to Telegram`);
                // Small delay between cities to avoid rate limits
                if (config_1.config.cities.indexOf(cityConfig) < config_1.config.cities.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        catch (error) {
            console.error('❌ Error running Events Bot:', error);
            process.exit(1);
        }
    }
}
// Run the bot
const bot = new EventsBot();
bot.run().catch(console.error);
//# sourceMappingURL=main.js.map