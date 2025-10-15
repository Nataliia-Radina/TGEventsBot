import { EventsBot } from '../main';
export declare class SchedulerService {
    private eventsBot;
    private dailyJob;
    constructor(eventsBot: EventsBot);
    startDailySchedule(): void;
    stopDailySchedule(): void;
    startTestSchedule(): void;
    getNextScheduledRun(): string | null;
}
//# sourceMappingURL=schedulerService.d.ts.map