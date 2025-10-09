import { ProcessedEvent } from '../types/events';
export declare class TelegramService {
    private bot;
    constructor();
    postEvents(events: ProcessedEvent[], chatId: string, cityName: string): Promise<void>;
    private createHeaderMessage;
    private createMessageChunks;
    private createContinuationHeader;
    private formatSingleEvent;
    private createCategoryMessage;
    private sendMessage;
    private getCategoryEmoji;
    private cleanEventTitle;
    private escapeMarkdown;
    private delay;
}
//# sourceMappingURL=telegramService.d.ts.map