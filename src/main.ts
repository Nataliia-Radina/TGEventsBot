import { ApifyService } from './services/apifyService';
import { TelegramService } from './services/telegramService';
import { LinkedInService } from './services/linkedinService';
import { LLMCategorizationService } from './services/llmCategorizationService';
import { EventDeduplicator } from './utils/eventDeduplicator';
import { EventFilter } from './utils/eventFilter';
import { config } from './config/config';
import { RawEvent, ProcessedEvent } from './types/events';

export class EventsBot {
  private apifyService: ApifyService;
  private telegramService: TelegramService;
  private linkedinService: LinkedInService | null;
  private llmCategorizationService: LLMCategorizationService;

  constructor() {
    this.apifyService = new ApifyService();
    this.telegramService = new TelegramService();
    
    // Initialize LinkedIn service if credentials are available
    try {
      this.linkedinService = new LinkedInService();
      console.log('✅ LinkedIn service initialized');
    } catch (error) {
      this.linkedinService = null;
      console.log('⚠️  LinkedIn service disabled:', error instanceof Error ? error.message : error);
    }
    
    this.llmCategorizationService = new LLMCategorizationService();
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting Events Bot...');

      // Validate configuration
      if (!this.validateConfig()) {
        console.error('❌ Configuration validation failed. Exiting...');
        process.exit(1);
      }

      // Iterate through all configured cities
      for (const cityConfig of config.cities) {
        const { cityName, country, chatId } = cityConfig;

        console.log(`\n🚀 Processing ${cityName}, ${country}...`);

        // Fetch events from multiple sources
        console.log(`🔍 Fetching events for ${cityName}, ${country}...`);
        
        // Fetch Meetup events (primary source)
        const meetupEvents = await this.apifyService.fetchMeetupEvents(cityName, country);
        
        // Temporarily disable Luma until we find a working actor
        let lumaEvents: RawEvent[] = [];
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
        const allEvents: RawEvent[] = [...meetupEvents, ...lumaEvents];

        if (allEvents.length === 0) {
          console.log(`⚠️  No events fetched from sources for ${cityName}`);
          continue;
        }

        // Filter events
        const next7DaysEvents = EventFilter.filterNext7Days(allEvents);

        console.log(`🔍 Filtered to ${next7DaysEvents.length} ${cityName} events for next 7 days`);

        // Process and categorize events
        const processedEvents = EventFilter.processEvents(next7DaysEvents);
        const categorizedEvents = await this.llmCategorizationService.categorizeEventsBatch(processedEvents);
        const deduplicatedEvents = EventDeduplicator.deduplicateEvents(categorizedEvents);
        const sortedEvents = deduplicatedEvents.sort((a: ProcessedEvent, b: ProcessedEvent) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log(`🔄 Deduplicated from ${categorizedEvents.length} to ${deduplicatedEvents.length} events for ${cityName}`);

        // Post to Telegram
        await this.telegramService.postEvents(sortedEvents, chatId, cityName);
        console.log(`✅ Successfully posted ${cityName} events to Telegram`);

        // LinkedIn posting disabled - Marketing Developer Platform access denied
        // if (this.linkedinService) {
        //   try {
        //     await this.linkedinService.postEvents(sortedEvents, cityName);
        //     console.log(`✅ Successfully posted ${cityName} events to LinkedIn`);
        //   } catch (error) {
        //     console.error(`❌ Failed to post ${cityName} events to LinkedIn:`, error);
        //     // Don't fail the entire job if LinkedIn posting fails
        //   }
        // }
        console.log('⚠️  LinkedIn posting disabled - no Marketing Developer Platform access');

        // Small delay between cities to avoid rate limits
        if (config.cities.indexOf(cityConfig) < config.cities.length - 1) {
          await new Promise(resolve => setTimeout(resolve, config.delays.betweenCity));
        }
      }
    } catch (error) {
      console.error('❌ Error running Events Bot:', error);
      process.exit(1);
    }
  }

  private validateConfig(): boolean {
    console.log('✅ Configuration validation passed');
    return true;
  }
}

// Run the bot once
const bot = new EventsBot();
bot.run().catch(console.error);