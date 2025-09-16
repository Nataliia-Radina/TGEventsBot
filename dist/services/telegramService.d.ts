import { ProcessedEvent } from '../types/events';
export declare class TelegramService {
    private bot;
    constructor();
    postEvents(events: ProcessedEvent[], chatId: string, cityName: string): Promise<void>;
    private createHeaderMessage;
    private createCategoryMessage;
    private sendMessage;
    private cleanEventTitle;
    private escapeMarkdown;
    private delay;
}
//# sourceMappingURL=telegramService.d.ts.map