import { RawEvent } from '../types/events';
export declare class ApifyService {
    private client;
    constructor();
    fetchMeetupEvents(city: string, country: string): Promise<RawEvent[]>;
    fetchLumaEvents(city: string, country: string): Promise<RawEvent[]>;
    private transformMeetupEvent;
    private transformLumaEvent;
    private getEndDate;
}
//# sourceMappingURL=apifyService.d.ts.map