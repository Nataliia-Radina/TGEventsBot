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
//# sourceMappingURL=events.d.ts.map