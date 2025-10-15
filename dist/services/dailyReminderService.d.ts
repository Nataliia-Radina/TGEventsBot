export declare class DailyReminderService {
    private apifyService;
    private telegramService;
    private llmCategorizationService;
    constructor();
    sendTodaysEvents(): Promise<void>;
    private filterTodaysEvents;
    private sendNoEventsMessage;
    private sendTodaysEventsMessage;
    private getCategoryEmoji;
    private cleanEventTitle;
    private escapeMarkdown;
}
//# sourceMappingURL=dailyReminderService.d.ts.map