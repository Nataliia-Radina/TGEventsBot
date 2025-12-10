import { RawEvent, ProcessedEvent } from '../types/events';
import { config } from '../config/config';
import { DateUtils } from './dateUtils';

export class EventFilter {

  static filterNextWeek(events: RawEvent[]): RawEvent[] {
    const now = DateUtils.nowInAmsterdam();
    const endDate = DateUtils.addDaysInAmsterdam(config.daysAhead);

    return events.filter(event => {
      const eventDate = DateUtils.toAmsterdamTime(event.date);
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
    const now = DateUtils.nowInAmsterdam();
    const endDate = DateUtils.addDaysInAmsterdam(config.daysAhead);
    
    const eventDate = DateUtils.toAmsterdamTime(event.date);
    return eventDate >= now && eventDate <= endDate;
  }

  private static formatDate(dateStr: string): string {
    const date = DateUtils.toAmsterdamTime(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Amsterdam'
    });
  }
}