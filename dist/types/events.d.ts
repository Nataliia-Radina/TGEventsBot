export interface RawEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    location?: string;
    city?: string;
    country?: string;
    url: string;
    source: 'meetup' | 'luma';
    tags?: string[];
    category?: string;
    attendees: number;
    org: string;
}
export interface ProcessedEvent extends RawEvent {
    category: EventCategory;
    formattedDate: string;
    isNext7Days: boolean;
}
export type EventCategory = 'AI' | 'Product' | 'Engineering' | 'Business' | 'UX' | 'Lifestyle' | 'Other';
export interface CategoryKeywords {
    [key: string]: string[];
}
export interface TelegramMessage {
    category: EventCategory;
    events: ProcessedEvent[];
}
export interface ApifyRunOptions {
    actorId?: string;
    input: Record<string, any>;
    timeout?: number;
}
export interface ApifyMeetupItem {
    id?: string;
    eventId?: string;
    name?: string;
    eventName?: string;
    description?: string;
    eventDescription?: string;
    time?: string;
    dateTime?: string;
    date?: string;
    venue?: {
        name?: string;
        address?: string;
        city?: string;
    };
    location?: string;
    address?: string;
    link?: string;
    url?: string;
    eventUrl?: string;
    actualAttendees?: number;
    organizedByGroup?: string;
    topics?: string[];
    eventType?: string;
}
//# sourceMappingURL=events.d.ts.map