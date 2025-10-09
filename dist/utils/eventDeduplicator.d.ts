import { ProcessedEvent } from '../types/events';
export declare class EventDeduplicator {
    static deduplicateEvents(events: ProcessedEvent[]): ProcessedEvent[];
    private static areEventsSimilar;
    private static normalizeTitle;
}
//# sourceMappingURL=eventDeduplicator.d.ts.map