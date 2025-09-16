import { RawEvent, ProcessedEvent } from '../types/events';
import { config } from '../config/config';

export class EventFilter {

  static filterNext7Days(events: RawEvent[]): RawEvent[] {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + config.daysAhead);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= endDate;
    });
  }

  static processEvents(events: RawEvent[]): ProcessedEvent[] {
    return events.map(event => ({
      ...event,
      category: 'Other' as const,
      formattedDate: this.formatDate(event.date),
      isNext7Days: this.isNext7Days(event),
    }));
  }

  private static isNext7Days(event: RawEvent): boolean {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + config.daysAhead);
    
    const eventDate = new Date(event.date);
    return eventDate >= now && eventDate <= endDate;
  }

  private static formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}