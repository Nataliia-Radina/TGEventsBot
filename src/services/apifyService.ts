import { ApifyClient } from 'apify-client';
import { config } from '../config/config';
import { RawEvent, ApifyRunOptions, ApifyMeetupItem } from '../types/events';

export class ApifyService {
  private client: ApifyClient;

  constructor() {
    if (!config.apify.token) {
      throw new Error('APIFY_API_TOKEN is required but not provided in environment variables');
    }
    this.client = new ApifyClient({
      token: config.apify.token,
    });
  }

  async fetchMeetupEvents(city: string, country: string): Promise<RawEvent[]> {
    console.log(`Fetching Meetup events from Apify for ${city}, ${country}...`);

    const runOptions: ApifyRunOptions = {
      actorId: config.apify.meetupActorId,
      input: {
        ...config.defaultFilters,
        city,
        country,
      },
      timeout: config.apify.timeout,
    };

    try {
      console.log(`🔄 Starting Apify actor ${runOptions.actorId} for ${city}, ${country}`);
      const run = await this.client.actor(runOptions.actorId!).call(runOptions.input);
      
      if (!run.defaultDatasetId) {
        console.error(`❌ No dataset ID returned from Apify run for ${city}`);
        return [];
      }

      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      console.log(`📥 Retrieved ${items.length} raw items from Apify for ${city}`);

      const filteredItems = items.filter((item: ApifyMeetupItem) => item.eventType === 'PHYSICAL');
      console.log(`🔍 Filtered to ${filteredItems.length} physical events for ${city}`);

      const transformedEvents = filteredItems.map((item: ApifyMeetupItem) => this.transformMeetupEvent(item, city, country));
      const attendeeFilteredEvents = transformedEvents.filter((item: RawEvent) => item.attendees > config.minAttendees);
      const aiFilteredEvents = attendeeFilteredEvents.filter((event: RawEvent) => this.isAIRelated(event));
      
      console.log(`👥 Filtered to ${attendeeFilteredEvents.length} events with >${config.minAttendees} attendees for ${city}`);
      console.log(`🤖 Filtered to ${aiFilteredEvents.length} AI-related Meetup events for ${city}`);
      return aiFilteredEvents;
    } catch (error) {
      console.error(`❌ Error fetching Meetup events for ${city}, ${country}:`, error);
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
        console.error(`   Stack trace: ${error.stack}`);
      }
      return [];
    }
  }

  async fetchLumaEvents(city: string, country: string): Promise<RawEvent[]> {
    console.log(`Fetching Luma events from Apify for ${city}, ${country}...`);

    const runOptions: ApifyRunOptions = {
      actorId: config.apify.lumaActorId,
      input: {
        location: city.charAt(0).toUpperCase() + city.slice(1),
        maxResults: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: this.getEndDate().toISOString().split('T')[0],
        // Add AI-specific search terms for Luma
        searchQuery: "AI artificial intelligence machine learning data science"
      },
      timeout: config.apify.timeout,
    };

    try {
      console.log(`🔄 Starting Apify actor ${runOptions.actorId} for ${city}, ${country}`);
      const run = await this.client.actor(runOptions.actorId!).call(runOptions.input);
      
      if (!run.defaultDatasetId) {
        console.error(`❌ No dataset ID returned from Apify run for ${city}`);
        return [];
      }

      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      console.log(`📥 Retrieved ${items.length} raw items from Luma for ${city}`);

      const transformedEvents = items.map((item: any) => this.transformLumaEvent(item, city, country));
      const aiFilteredEvents = transformedEvents.filter((event: RawEvent) => this.isAIRelated(event));
      
      console.log(`🤖 Filtered to ${aiFilteredEvents.length} AI-related Luma events for ${city}`);
      return aiFilteredEvents;
    } catch (error) {
      console.error(`❌ Error fetching Luma events for ${city}, ${country}:`, error);
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
      }
      return [];
    }
  }

  private transformLumaEvent(item: any, city: string, country: string): RawEvent {
    return {
      id: item.id || item.eventId || Math.random().toString(),
      title: item.name || item.title || 'Untitled Event',
      description: item.description || '',
      date: item.start_at || item.dateTime || item.date || new Date().toISOString(),
      location: item.geo_address_json?.address || item.location || '',
      city: city,
      country: country,
      url: item.url || '',
      source: 'luma',
      tags: item.tags || [],
      attendees: item.going_count || item.actualAttendees || 0,
      org: item.host?.name || item.organizedByGroup || 'Unknown',
    };
  }

  private transformMeetupEvent(item: ApifyMeetupItem, city: string, country: string): RawEvent {
    return {
      id: item.id || item.eventId || Math.random().toString(),
      title: item.name || item.eventName || 'Untitled Event',
      description: item.description || item.eventDescription || '',
      date: item.time || item.dateTime || item.date || new Date().toISOString(),
      location: item.venue?.address || item.location || item.address || '',
      city: item.venue?.city || city,
      country: country,
      url: item.link || item.url || item.eventUrl || '',
      source: 'meetup',
      attendees: item.actualAttendees || 0,
      org: item.organizedByGroup || 'Unknown',
      tags: item.topics || [],
    };
  }


  private isAIRelated(event: RawEvent): boolean {
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning', 
      'neural networks', 'llm', 'llms', 'gpt', 'chatgpt', 'openai', 
      'data science', 'computer vision', 'nlp', 'generative ai', 
      'automation', 'robotics', 'ml', 'data', 'analytics', 
      'prompt engineering', 'ai tools', 'ai art', 'ai drawing', 
      'midjourney', 'stable diffusion', 'ai startup', 'ai product', 
      'ai development', 'tensorflow', 'pytorch', 'hugging face',
      'transformers', 'bert', 'gpt-3', 'gpt-4', 'claude', 'anthropic',
      'ai ethics', 'agi', 'artificial general intelligence'
    ];

    const searchText = `${event.title} ${event.description} ${event.org}`.toLowerCase();
    
    return aiKeywords.some(keyword => searchText.includes(keyword));
  }

  private getEndDate(): Date {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + config.daysAhead);
    return endDate;
  }
}