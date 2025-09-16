import { ProcessedEvent } from '../types/events';

export class EventDeduplicator {
  static deduplicateEvents(events: ProcessedEvent[]): ProcessedEvent[] {
    const deduplicated: ProcessedEvent[] = [];

    for (const event of events) {
      const isDuplicate = deduplicated.some(existing =>
        this.areEventsSimilar(event, existing)
      );

      if (!isDuplicate) {
        deduplicated.push(event);
      }
    }

    return deduplicated;
  }

  private static areEventsSimilar(event1: ProcessedEvent, event2: ProcessedEvent): boolean {
    // Check if same date/time
    if (event1.date !== event2.date) {
      return false;
    }

    // Normalize titles for comparison
    const title1 = this.normalizeTitle(event1.title);
    const title2 = this.normalizeTitle(event2.title);

    // Check if one title is a subset of another (handles cases like "Event" vs "Event | Location")
    return title1.includes(title2) || title2.includes(title1);
  }

  private static normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      // Remove common separators and location info
      .split(/[|\\|,]/)
      [0]
      .trim()
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove punctuation at the end
      .replace(/[.,:;!?]+$/, '');
  }
}