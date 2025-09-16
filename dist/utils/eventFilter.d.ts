import { RawEvent, ProcessedEvent } from '../types/events';
export declare class EventFilter {
    static filterNext7Days(events: RawEvent[]): RawEvent[];
    static processEvents(events: RawEvent[]): ProcessedEvent[];
    private static isNext7Days;
    private static formatDate;
}
//# sourceMappingURL=eventFilter.d.ts.map