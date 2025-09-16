import { ProcessedEvent, EventCategory } from '../types/events';
export declare class EventCategorizer {
    private static llmService;
    static categorizeEvents(events: ProcessedEvent[]): Promise<ProcessedEvent[]>;
    static groupByCategory(events: ProcessedEvent[]): Map<EventCategory, ProcessedEvent[]>;
    static getSortedCategories(): EventCategory[];
}
//# sourceMappingURL=eventCategorizer.d.ts.map