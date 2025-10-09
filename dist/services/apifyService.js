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
            console.log(`📥 Retrieved ${items.length} raw items from Apify for ${city}`);
            const filteredItems = items.filter((item) => item.eventType === 'PHYSICAL');
            console.log(`🔍 Filtered to ${filteredItems.length} physical events for ${city}`);
            const transformedEvents = filteredItems.map((item) => this.transformMeetupEvent(item, city, country));
            const finalEvents = transformedEvents.filter((item) => item.attendees > config_1.config.minAttendees);
            console.log(`👥 Filtered to ${finalEvents.length} events with >${config_1.config.minAttendees} attendees for ${city}`);
            return finalEvents;
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
    getEndDate() {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + config_1.config.daysAhead);
        return endDate;
    }
}
exports.ApifyService = ApifyService;
//# sourceMappingURL=apifyService.js.map