import { ApifyService } from './apifyService';
import { TelegramService } from './telegramService';
import { LLMCategorizationService } from './llmCategorizationService';
import { EventDeduplicator } from '../utils/eventDeduplicator';
import { EventFilter } from '../utils/eventFilter';
import { DateUtils } from '../utils/dateUtils';
import { config } from '../config/config';
import { RawEvent, ProcessedEvent } from '../types/events';

export class DailyReminderService {
  private apifyService: ApifyService;
  private telegramService: TelegramService;
  private llmCategorizationService: LLMCategorizationService;

  constructor() {
    this.apifyService = new ApifyService();
    this.telegramService = new TelegramService();
    this.llmCategorizationService = new LLMCategorizationService();
  }

  async sendTodaysEvents(): Promise<void> {
    try {
      console.log('📅 Starting daily events reminder...');

      for (const cityConfig of config.cities) {
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
        const processedEvents = EventFilter.processEvents(todaysEvents);
        const categorizedEvents = await this.llmCategorizationService.categorizeEventsBatch(processedEvents);
        const deduplicatedEvents = EventDeduplicator.deduplicateEvents(categorizedEvents);
        const sortedEvents = deduplicatedEvents.sort((a: ProcessedEvent, b: ProcessedEvent) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Send today's events
        await this.sendTodaysEventsMessage(sortedEvents, cityName, chatId);

        console.log(`✅ Successfully sent today's events for ${cityName}`);

        // Small delay between cities
        if (config.cities.indexOf(cityConfig) < config.cities.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('❌ Error sending daily reminder:', error);
      throw error;
    }
  }

  private filterTodaysEvents(events: RawEvent[]): RawEvent[] {
    const todayDateString = DateUtils.getCurrentAmsterdamDateString();
    
    console.log(`🕐 DEBUG: Today in Amsterdam: ${todayDateString}`);
    
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateString = DateUtils.getAmsterdamDateString(eventDate);
      const isToday = eventDateString === todayDateString;
      
      if (events.indexOf(event) < 3) { // Debug first 3 events
        console.log(`🕐 DEBUG Event "${event.title}":`);
        console.log(`   Original: ${event.date}`);
        console.log(`   Event date (Amsterdam): ${eventDateString}`);
        console.log(`   Is today: ${isToday}`);
      }
      
      return isToday;
    });
    
    console.log(`🕐 DEBUG: Filtered ${filteredEvents.length} events for today`);
    return filteredEvents;
  }

  private async sendNoEventsMessage(cityName: string, chatId: string): Promise<void> {
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

  private async sendTodaysEventsMessage(events: ProcessedEvent[], cityName: string, chatId: string): Promise<void> {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    let message = `🎯 ${events.length} event${events.length > 1 ? 's' : ''} happening TODAY - ${dayName}, ${dateStr}:
`;

    events.forEach(event => {
      const eventTime = new Date(event.date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
      });
      
      const categoryEmoji = this.getCategoryEmoji(event.category);
      const cleanTitle = this.cleanEventTitle(event.title);
      
    message += `⏰ ${eventTime} - ${cleanTitle}\n`;
    message += `${categoryEmoji} ${event.category} • ${event.url}\n\n`;
    });


    await this.telegramService.sendMessage(message, chatId);
  }

  private getCategoryEmoji(category: string): string {
    const categoryEmojis: { [key: string]: string } = {
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

  private cleanEventTitle(title: string): string {
    return title.replace(/\[[^\]]*\]/g, '').trim();
  }

}
