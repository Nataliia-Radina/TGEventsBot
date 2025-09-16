import { ApifyService } from './services/apifyService';
import { TelegramService } from './services/telegramService';
import { EventFilter } from './utils/eventFilter';
import { EventCategorizer } from './utils/eventCategorizer';
import { validateConfig, config } from './config/config';
import { EventDeduplicator } from './utils/eventDeduplicator';
import { RawEvent } from './types/events';

class EventsBot {
  private apifyService: ApifyService;
  private telegramService: TelegramService;

  constructor() {
    this.apifyService = new ApifyService();
    this.telegramService = new TelegramService();
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting Events Bot...');

      // Validate configuration
      if (!validateConfig()) {
        console.error('❌ Configuration validation failed. Exiting...');
        process.exit(1);
      }

      // Iterate through all configured cities
      for (const cityConfig of config.cities) {
        const { cityName, country, chatId } = cityConfig;

        console.log(`\n🚀 Processing ${cityName}, ${country}...`);

        // Fetch events from multiple sources for this city
        const [meetupEvents, lumaEvents] = await Promise.all([
          this.apifyService.fetchMeetupEvents(cityName, country),
          /*this.apifyService.fetchLumaEvents(cityName, country)*/ () => []
        ]);

        console.log(`📊 Fetched ${meetupEvents.length} Meetup events and ${lumaEvents.length} Luma events for ${cityName}`);

        // Combine all events
        // @ts-ignore
        const allEvents: RawEvent[] = [...meetupEvents, ...lumaEvents];

        if (allEvents.length === 0) {
          console.log(`⚠️  No events fetched from sources for ${cityName}`);
          await this.telegramService.postEvents([], chatId, cityName);
          continue;
        }

        // Filter events
        const next7DaysEvents = EventFilter.filterNext7Days(allEvents);

        console.log(`🔍 Filtered to ${next7DaysEvents.length} ${cityName} events for next 7 days`);

        // Process and categorize events
        const processedEvents = EventFilter.processEvents(next7DaysEvents);
        const categorizedEvents = await EventCategorizer.categorizeEvents(processedEvents);
        const deduplicatedEvents = EventDeduplicator.deduplicateEvents(categorizedEvents);
        const sortedEvents = deduplicatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log(`🔄 Deduplicated from ${categorizedEvents.length} to ${deduplicatedEvents.length} events for ${cityName}`);

        // Post to Telegram
        await this.telegramService.postEvents(sortedEvents, chatId, cityName);

        console.log(`✅ Successfully posted ${cityName} events to Telegram`);

        // Small delay between cities to avoid rate limits
        if (config.cities.indexOf(cityConfig) < config.cities.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error('❌ Error running Events Bot:', error);
      process.exit(1);
    }
  }
}

// Run the bot
const bot = new EventsBot();
bot.run().catch(console.error);