// Utility functions for timezone-aware date handling
// All dates should use Amsterdam timezone (Europe/Amsterdam) since events are in Amsterdam

export class DateUtils {
  private static readonly AMSTERDAM_TIMEZONE = 'Europe/Amsterdam';

  /**
   * Get current date/time in Amsterdam timezone
   */
  static nowInAmsterdam(): Date {
    const now = new Date();
    // Simply return the current date - we'll handle timezone in formatting
    return now;
  }

  /**
   * Convert a date string to Amsterdam timezone
   */
  static toAmsterdamTime(dateStr: string): Date {
    // Return the original date - events are already in correct timezone
    return new Date(dateStr);
  }

  /**
   * Get current date in Amsterdam timezone as a formatted string
   */
  static getCurrentAmsterdamDateString(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: DateUtils.AMSTERDAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    }).format(new Date());
  }

  /**
   * Get date string for a given date in Amsterdam timezone
   */
  static getAmsterdamDateString(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: DateUtils.AMSTERDAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  /**
   * Get today's date range in Amsterdam timezone (start and end of day)
   */
  static getTodayRangeInAmsterdam(): { start: Date; end: Date } {
    const now = DateUtils.nowInAmsterdam();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }

  /**
   * Get date N days from now in Amsterdam timezone
   */
  static addDaysInAmsterdam(days: number): Date {
    const now = DateUtils.nowInAmsterdam();
    const result = new Date(now);
    result.setDate(now.getDate() + days);
    return result;
  }

  /**
   * Format date for API calls (YYYY-MM-DD)
   */
  static formatForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}