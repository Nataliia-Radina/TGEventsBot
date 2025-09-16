import { ApifyClient } from 'apify-client';
import { config } from '../config/config';
import { RawEvent, ApifyRunOptions } from '../types/events';

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
      const run = await this.client.actor(runOptions.actorId!).call(runOptions.input);
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      const filteredItems = items.filter((item) => item.eventType === 'PHYSICAL')


      return filteredItems.map(item => this.transformMeetupEvent(item, city, country)).filter( item => item.attendees > config.minAttendees);
    } catch (error) {
      console.error('Error fetching Meetup events:', error);
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
      },
      timeout: config.apify.timeout,
    };

    try {
      const run = await this.client.actor(runOptions.actorId!).call(runOptions.input);
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      return items.map(item => this.transformLumaEvent(item, city, country));
    } catch (error) {
      console.error('Error fetching Luma events:', error);
      return [];
    }
  }

  private transformMeetupEvent(item: any, city: string, country: string): RawEvent {
    return {
      id: item.id || item.eventId || Math.random().toString(),
      title: item.name || item.eventName || 'Untitled Event',
      description: item.description || item.eventDescription || '',
      date: item.time || item.dateTime || item.date,
      location: item.venue?.address || item.location || item.address || '',
      city: item.venue?.city || city,
      country: country,
      url: item.link || item.url || item.eventUrl || '',
      source: 'meetup',
      attendees: item.actualAttendees,
      org: item.organizedByGroup,
      tags: item.topics || [],
    };
  }

  private transformLumaEvent(item: any, city: string, country: string): RawEvent {
    return {
      id: item.id || item.eventId || Math.random().toString(),
      title: item.name || item.title || 'Untitled Event',
      description: item.description || '',
      date: item.start_at || item.dateTime || item.date,
      location: item.geo_address_json?.address || item.location || '',
      city: city,
      country: country,
      url: item.url || '',
      source: 'luma',
      tags: item.tags || [],
      attendees: item.actualAttendees || 0,
      org: item.organizedByGroup,
    };
  }

  private getEndDate(): Date {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + config.daysAhead);
    return endDate;
  }
}