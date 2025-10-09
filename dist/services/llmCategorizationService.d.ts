import { ProcessedEvent, EventCategory } from '../types/events';
export declare class LLMCategorizationService {
    private openai;
    constructor();
    categorizeEvent(event: ProcessedEvent): Promise<EventCategory>;
    private createPrompt;
    categorizeEventsBatch(events: ProcessedEvent[]): Promise<ProcessedEvent[]>;
}
//# sourceMappingURL=llmCategorizationService.d.ts.map