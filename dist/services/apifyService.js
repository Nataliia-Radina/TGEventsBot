"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifyService = void 0;
const apify_client_1 = require("apify-client");
const config_1 = require("../config/config");
class ApifyService {
    constructor() {
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
            const run = await this.client.actor(runOptions.actorId).call(runOptions.input);
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
            const filteredItems = items.filter((item) => item.eventType === 'PHYSICAL');
            return filteredItems.map(item => this.transformMeetupEvent(item, city, country));
        }
        catch (error) {
            console.error('Error fetching Meetup events:', error);
            return [];
        }
    }
    async fetchLumaEvents(city, country) {
        console.log(`Fetching Luma events from Apify for ${city}, ${country}...`);
        const runOptions = {
            actorId: config_1.config.apify.lumaActorId,
            input: {
                location: city.charAt(0).toUpperCase() + city.slice(1),
                maxResults: 100,
                startDate: new Date().toISOString().split('T')[0],
                endDate: this.getEndDate().toISOString().split('T')[0],
            },
            timeout: config_1.config.apify.timeout,
        };
        try {
            const run = await this.client.actor(runOptions.actorId).call(runOptions.input);
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
            return items.map(item => this.transformLumaEvent(item, city, country));
        }
        catch (error) {
            console.error('Error fetching Luma events:', error);
            return [];
        }
    }
    transformMeetupEvent(item, city, country) {
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
    transformLumaEvent(item, city, country) {
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
    getEndDate() {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + config_1.config.daysAhead);
        return endDate;
    }
}
exports.ApifyService = ApifyService;
//# sourceMappingURL=apifyService.js.map