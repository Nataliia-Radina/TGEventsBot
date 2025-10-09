import { ApifyClient } from 'apify-client';
import { config } from '../config/config';
import { RawEvent, ApifyRunOptions, ApifyMeetupItem } from '../types/events';

export class ApifyService {
  private client: ApifyClient;

  constructor() {
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
      const finalEvents = transformedEvents.filter((item: RawEvent) => item.attendees > config.minAttendees);
      
      console.log(`👥 Filtered to ${finalEvents.length} events with >${config.minAttendees} attendees for ${city}`);
      return finalEvents;
    } catch (error) {
      console.error(`❌ Error fetching Meetup events for ${city}, ${country}:`, error);
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
        console.error(`   Stack trace: ${error.stack}`);
      }
      return [];
    }
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


  private getEndDate(): Date {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + config.daysAhead);
    return endDate;
  }
}