import { ProcessedEvent, EventCategory } from '../types/events';
import { LLMCategorizationService } from '../services/llmCategorizationService';

export class EventCategorizer {
  private static llmService = new LLMCategorizationService();

  static async categorizeEvents(events: ProcessedEvent[]): Promise<ProcessedEvent[]> {
    console.log('🤖 Categorizing events with LLM...');
    return await this.llmService.categorizeEventsBatch(events);
  }

  static groupByCategory(events: ProcessedEvent[]): Map<EventCategory, ProcessedEvent[]> {
    const grouped = new Map<EventCategory, ProcessedEvent[]>();
    
    events.forEach(event => {
      const category = event.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(event);
    });

    return grouped;
  }


  static getSortedCategories(): EventCategory[] {
    return ['AI', 'Product', 'Engineering', 'Business', 'UX', 'Lifestyle', 'Other'];
  }
}