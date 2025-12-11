import { ApifyClient } from 'apify-client';
import { config } from '../config/config';
import { RawEvent, ApifyRunOptions, ApifyMeetupItem } from '../types/events';
import { DateUtils } from '../utils/dateUtils';

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
      console.log(`📥 Retrieved ${items.length} raw Meetup items for ${city}`);

      const filteredItems = items.filter((item: ApifyMeetupItem) => item.eventType === 'PHYSICAL');
      console.log(`🔍 Filtered to ${filteredItems.length} physical Meetup events for ${city}`);

      const transformedEvents = filteredItems.map((item: ApifyMeetupItem) => this.transformMeetupEvent(item, city, country));
      const attendeeFilteredEvents = transformedEvents.filter((item: RawEvent) => item.attendees > config.minAttendees);
      console.log(`👥 Filtered to ${attendeeFilteredEvents.length} Meetup events with >${config.minAttendees} attendees for ${city}`);

      console.log(`🤖 Starting tech filtering for Meetup events...`);
      const techFilteredEvents = attendeeFilteredEvents.filter((event: RawEvent) => this.isTechRelated(event));
      
      console.log(`📊 MEETUP RESULTS: ${items.length} raw → ${filteredItems.length} physical → ${attendeeFilteredEvents.length} with attendees → ${techFilteredEvents.length} tech-related events for ${city}`);
      return techFilteredEvents;
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
    console.log(`Using Luma actor: ${config.apify.lumaActorId}`);

    const runOptions: ApifyRunOptions = {
      actorId: config.apify.lumaActorId,
      input: {
        query: `${city}, ${country}, AI, tech`
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
      console.log(`📥 Retrieved ${items.length} raw Luma items for ${city}`);

      if (items.length === 0) {
        console.log(`⚠️  No Luma events found for ${city} - this might indicate the actor didn't find any events or failed`);
        return [];
      }

      console.log(`🔄 Processing ${items.length} Luma events for AI filtering...`);
      const transformedEvents = items.map((item: any) => this.transformLumaEvent(item, city, country));
      console.log(`✅ Transformed ${transformedEvents.length} Luma events`);

      console.log(`🤖 Starting tech filtering for Luma events...`);
      const techFilteredEvents = transformedEvents.filter((event: RawEvent) => this.isTechRelated(event));
      
      console.log(`📊 LUMA RESULTS: ${items.length} raw → ${transformedEvents.length} transformed → ${techFilteredEvents.length} tech-related events for ${city}`);
      return techFilteredEvents;
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
    // Since venue data isn't available from the scraper, we'll leave location empty
    // and handle it in the formatting layer
    return {
      id: item.id || item.eventId || Math.random().toString(),
      title: item.name || item.eventName || 'Untitled Event',
      description: item.description || item.eventDescription || '',
      date: item.time || item.dateTime || item.date || new Date().toISOString(),
      location: '', // Venue data not available from current scraper
      city: city,
      country: country,
      url: item.link || item.url || item.eventUrl || '',
      source: 'meetup',
      attendees: item.actualAttendees || 0,
      org: item.organizedByGroup || 'Unknown',
      tags: item.topics || [],
    };
  }


  private isTechRelated(event: RawEvent): boolean {
    // Tech keywords - include AI/ML, programming, data, cloud, etc.
    const techKeywords = [
      // AI/ML keywords
      'artificial intelligence', 'machine learning', 'deep learning', 
      'neural networks', 'llm', 'llms', 'gpt', 'chatgpt', 'openai', 
      'generative ai', 'computer vision', 'natural language processing',
      'prompt engineering', 'ai tools', 'tensorflow', 'pytorch', 'hugging face',
      'transformers', 'bert', 'gpt-3', 'gpt-4', 'claude', 'anthropic',
      'ai ethics', 'agi', 'artificial general intelligence',
      // Search & AI specific
      'agentic', 'search engines', 'reasoning', 'profitability ai', 'ai',
      // Programming languages
      'python', 'javascript', 'typescript', 'java', 'kotlin', 'rust', 'go', 'golang',
      'c++', 'c#', 'php', 'ruby', 'swift', 'scala', 'r programming', 'sql',
      // Data & Analytics
      'databricks', 'data science', 'data analytics', 'analytics', 
      'data engineering', 'mlops', 'ml ops', 'data pipeline', 'data platform',
      'spark', 'apache spark', 'jupyter', 'pandas', 'numpy', 'scikit-learn',
      'data visualization', 'big data', 'predictive analytics', 'statistical analysis',
      'geospatial analytics', 'spatial analytics', 'data mining', 'dbt', 'data warehouse',
      // Cloud & Infrastructure
      'aws', 'azure', 'google cloud', 'gcp', 'kubernetes', 'docker', 'devops',
      'cloud native', 'microservices', 'serverless', 'platform engineering',
      // Development & Tools
      'software development', 'web development', 'mobile development', 'frontend', 'backend',
      'fullstack', 'api', 'rest api', 'graphql', 'react', 'vue', 'angular', 'nodejs',
      'laravel', 'symfony', 'django', 'flask', 'spring', 'testing', 'qa',
      'cybersecurity', 'security', 'blockchain', 'crypto', 'fintech',
      // Tech concepts (essential generic terms)
      'tech', 'technology', 'engineering', 'software engineering', 'developer', 'programming', 'coding',
      'startup', 'tech startup', 'product management', 'ux', 'ui', 'ux design', 'ui design', 'design system',
      // Specific event types
      'coding club', 'tech networking'
    ];

    // Events to exclude (non-tech social/lifestyle events)
    const excludeKeywords = [
      'drinks only', 'social drinks', 'coffee meetup',
      'running club', 'fitness', 'yoga', 'meditation', 'art meetup', 'drawing',
      'painting', 'photography meetup', 'book club', 'language exchange',
      'cooking', 'food meetup', 'wine tasting', 'beer tasting',
      // Add specific exclusions for events you don't want
      'japanese language', 'language club', 'storytelling', 'public speaking',
      'mapathon', 'missing maps', 'vibe check', 'reflect', 'reset',
      'socrates cafe', 'philosophy', 'mindfulness', 'personal development',
      'life coaching', 'wellness', 'spiritual', 'self-help',
      'light festival', 'festival walk', 'walking tour', 'sightseeing',
      // Cultural and historical events
      'biography', 'jewish amsterdam', 'mokum', 'culture group', 'cultural tour',
      'historical tour', 'museum tour', 'art tour', 'architecture tour',
      // Sports and physical activities
      'bouldering', 'climbing', 'volleyball', 'sports', 'football', 'soccer',
      'basketball', 'tennis', 'badminton', 'swimming', 'cycling', 'hiking',
      // Gaming and entertainment (non-tech)
      'dungeons and dragons', 'd&d', 'board games', 'card games', 'roleplay',
      'blood on the clocktower', 'custom script', 'tabletop',
      // Psychology and support groups
      'psychology talks', 'adhd meetup', 'support group', 'mental health',
      'therapy', 'counseling', 'being alone', 'time together',
      // Writing and creative (non-tech)
      'shut up & write', 'shutupandwrite', 'creative writing', 'poetry', 'writing workshop',
      // General socializing
      'global socializing', 'social meetup', 'hangout', 'goodbye 2025'
    ];

    const searchText = `${event.title} ${event.description} ${event.org}`.toLowerCase();

    // Check for excluded keywords first
    const hasExcludedKeyword = excludeKeywords.some(keyword => searchText.includes(keyword));
    if (hasExcludedKeyword) {
      return false;
    }

    // Check for tech keywords
    const isTech = techKeywords.some(keyword => searchText.includes(keyword));
    
    if (isTech) {
      console.log(`✅ Tech Event: ${event.title}`);
    } else {
      console.log(`❌ Non-tech Event filtered out: ${event.title}`);
    }
    
    return isTech;
  }

  private getEndDate(): Date {
    return DateUtils.addDaysInAmsterdam(config.daysAhead);
  }
}