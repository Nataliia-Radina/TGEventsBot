"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsBot = void 0;
const apifyService_1 = require("./services/apifyService");
const telegramService_1 = require("./services/telegramService");
const llmCategorizationService_1 = require("./services/llmCategorizationService");
const eventDeduplicator_1 = require("./utils/eventDeduplicator");
const eventFilter_1 = require("./utils/eventFilter");
const config_1 = require("./config/config");
class EventsBot {
    constructor() {
        this.apifyService = new apifyService_1.ApifyService();
        this.telegramService = new telegramService_1.TelegramService();
        this.llmCategorizationService = new llmCategorizationService_1.LLMCategorizationService();
    }
    async run() {
        try {
            console.log('🚀 Starting Events Bot...');
            // Validate configuration
            if (!this.validateConfig()) {
                console.error('❌ Configuration validation failed. Exiting...');
                process.exit(1);
            }
            // Iterate through all configured cities
            for (const cityConfig of config_1.config.cities) {
                const { cityName, country, chatId } = cityConfig;
                console.log(`\n🚀 Processing ${cityName}, ${country}...`);
                // Fetch events from multiple sources
                console.log(`🔍 Fetching events for ${cityName}, ${country}...`);
                // Fetch Meetup events (primary source)
                const meetupEvents = await this.apifyService.fetchMeetupEvents(cityName, country);
                // Temporarily disable Luma until we find a working actor
                let lumaEvents = [];
                console.log(`⚠️  Luma events temporarily disabled - focusing on Meetup AI events only`);
                // TODO: Re-enable when we find a working Luma actor
                // try {
                //   lumaEvents = await this.apifyService.fetchLumaEvents(cityName, country);
                // } catch (error) {
                //   console.warn(`⚠️  Luma events fetch failed for ${cityName}, continuing with Meetup only:`, error instanceof Error ? error.message : error);
                // }
                console.log(`📊 FINAL FETCH RESULTS for ${cityName}:`);
                console.log(`   🔸 Meetup: ${meetupEvents.length} AI-related events`);
                console.log(`   🔸 Luma: ${lumaEvents.length} AI-related events`);
                console.log(`   🔸 Total: ${meetupEvents.length + lumaEvents.length} AI events from both sources`);
                // Combine all events
                const allEvents = [...meetupEvents, ...lumaEvents];
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
                const categorizedEvents = await this.llmCategorizationService.categorizeEventsBatch(processedEvents);
                const deduplicatedEvents = eventDeduplicator_1.EventDeduplicator.deduplicateEvents(categorizedEvents);
                const sortedEvents = deduplicatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                console.log(`🔄 Deduplicated from ${categorizedEvents.length} to ${deduplicatedEvents.length} events for ${cityName}`);
                // Post to Telegram
                await this.telegramService.postEvents(sortedEvents, chatId, cityName);
                console.log(`✅ Successfully posted ${cityName} events to Telegram`);
                // Small delay between cities to avoid rate limits
                if (config_1.config.cities.indexOf(cityConfig) < config_1.config.cities.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, config_1.config.delays.betweenCities));
                }
            }
        }
        catch (error) {
            console.error('❌ Error running Events Bot:', error);
            process.exit(1);
        }
    }
    validateConfig() {
        console.log('✅ Configuration validation passed');
        return true;
    }
}
exports.EventsBot = EventsBot;
// Run the bot once
const bot = new EventsBot();
bot.run().catch(console.error);
//# sourceMappingURL=main.js.map