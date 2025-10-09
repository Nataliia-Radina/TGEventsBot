"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifyService = void 0;
const apify_client_1 = require("apify-client");
const config_1 = require("../config/config");
class ApifyService {
    constructor() {
        if (!config_1.config.apify.token) {
            throw new Error('APIFY_API_TOKEN is required but not provided in environment variables');
        }
        this.client = new apify_client_1.ApifyClient({
            token: config_1.config.apify.token,
        });
    }
    async fetchMeetupEvents(city, country) {
        console.log(`Fetching Meetup events from Apify for ${city}, ${country}...`);
        const runOptions = {
            actorId: config_1.config.apify.meetupActorId,
            input: {
                ...config_1.config.defaultFilters,
                city,
                country,
            },
            timeout: config_1.config.apify.timeout,
        };
        try {
            console.log(`🔄 Starting Apify actor ${runOptions.actorId} for ${city}, ${country}`);
            const run = await this.client.actor(runOptions.actorId).call(runOptions.input);
            if (!run.defaultDatasetId) {
                console.error(`❌ No dataset ID returned from Apify run for ${city}`);
                return [];
            }
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
            console.log(`📥 Retrieved ${items.length} raw Meetup items for ${city}`);
            const filteredItems = items.filter((item) => item.eventType === 'PHYSICAL');
            console.log(`🔍 Filtered to ${filteredItems.length} physical Meetup events for ${city}`);
            const transformedEvents = filteredItems.map((item) => this.transformMeetupEvent(item, city, country));
            const attendeeFilteredEvents = transformedEvents.filter((item) => item.attendees > config_1.config.minAttendees);
            console.log(`👥 Filtered to ${attendeeFilteredEvents.length} Meetup events with >${config_1.config.minAttendees} attendees for ${city}`);
            console.log(`🤖 Starting AI filtering for Meetup events...`);
            const aiFilteredEvents = attendeeFilteredEvents.filter((event) => this.isAIRelated(event));
            console.log(`📊 MEETUP RESULTS: ${items.length} raw → ${filteredItems.length} physical → ${attendeeFilteredEvents.length} with attendees → ${aiFilteredEvents.length} AI-related events for ${city}`);
            return aiFilteredEvents;
        }
        catch (error) {
            console.error(`❌ Error fetching Meetup events for ${city}, ${country}:`, error);
            if (error instanceof Error) {
                console.error(`   Error message: ${error.message}`);
                console.error(`   Stack trace: ${error.stack}`);
            }
            return [];
        }
    }
    async fetchLumaEvents(city, country) {
        console.log(`Fetching Luma events from Apify for ${city}, ${country}...`);
        console.log(`Using Luma actor: ${config_1.config.apify.lumaActorId}`);
        const runOptions = {
            actorId: config_1.config.apify.lumaActorId,
            input: {
                location: city.charAt(0).toUpperCase() + city.slice(1),
                maxResults: 50,
                startDate: new Date().toISOString().split('T')[0],
                endDate: this.getEndDate().toISOString().split('T')[0],
                // Try different input format for Luma
                query: "AI artificial intelligence machine learning"
            },
            timeout: config_1.config.apify.timeout,
        };
        try {
            console.log(`🔄 Starting Apify actor ${runOptions.actorId} for ${city}, ${country}`);
            const run = await this.client.actor(runOptions.actorId).call(runOptions.input);
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
            const transformedEvents = items.map((item) => this.transformLumaEvent(item, city, country));
            console.log(`✅ Transformed ${transformedEvents.length} Luma events`);
            console.log(`🤖 Starting AI filtering for Luma events...`);
            const aiFilteredEvents = transformedEvents.filter((event) => this.isAIRelated(event));
            console.log(`📊 LUMA RESULTS: ${items.length} raw → ${transformedEvents.length} transformed → ${aiFilteredEvents.length} AI-related events for ${city}`);
            return aiFilteredEvents;
        }
        catch (error) {
            console.error(`❌ Error fetching Luma events for ${city}, ${country}:`, error);
            if (error instanceof Error) {
                console.error(`   Error message: ${error.message}`);
            }
            return [];
        }
    }
    transformLumaEvent(item, city, country) {
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
    transformMeetupEvent(item, city, country) {
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
    isAIRelated(event) {
        // More specific AI keywords - avoid generic terms like 'data' or 'analytics'
        const strongAiKeywords = [
            'artificial intelligence', 'machine learning', 'deep learning',
            'neural networks', 'llm', 'llms', 'gpt', 'chatgpt', 'openai',
            'generative ai', 'computer vision', 'natural language processing',
            'prompt engineering', 'ai tools', 'ai art', 'ai drawing',
            'midjourney', 'stable diffusion', 'ai startup', 'ai product',
            'ai development', 'tensorflow', 'pytorch', 'hugging face',
            'transformers', 'bert', 'gpt-3', 'gpt-4', 'claude', 'anthropic',
            'ai ethics', 'agi', 'artificial general intelligence', 'ai native',
            'ai-powered', 'ai-driven', 'ai workshop', 'ai meetup', 'ai conference'
        ];
        // Also check for standalone 'AI' but be more careful
        const aiPattern = /\b(ai|ml)\b/i;
        const searchText = `${event.title} ${event.description} ${event.org}`.toLowerCase();
        // Must match either a strong keyword or the AI pattern
        const hasStrongKeyword = strongAiKeywords.some(keyword => searchText.includes(keyword));
        const hasAiPattern = aiPattern.test(searchText);
        const isAI = hasStrongKeyword || hasAiPattern;
        if (isAI) {
            console.log(`✅ AI Event: ${event.title}`);
        }
        else {
            console.log(`❌ Non-AI Event filtered out: ${event.title}`);
        }
        return isAI;
    }
    getEndDate() {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + config_1.config.daysAhead);
        return endDate;
    }
}
exports.ApifyService = ApifyService;
//# sourceMappingURL=apifyService.js.map