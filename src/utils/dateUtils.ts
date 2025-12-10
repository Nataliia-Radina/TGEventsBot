// Utility functions for timezone-aware date handling
// All dates should use Amsterdam timezone (Europe/Amsterdam) since events are in Amsterdam

export class DateUtils {
  private static readonly AMSTERDAM_TIMEZONE = 'Europe/Amsterdam';

  /**
   * Get current date/time in Amsterdam timezone
   */
  static nowInAmsterdam(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: DateUtils.AMSTERDAM_TIMEZONE }));
  }

  /**
   * Convert a date string to Amsterdam timezone
   */
  static toAmsterdamTime(dateStr: string): Date {
    const date = new Date(dateStr);
    return new Date(date.toLocaleString('en-US', { timeZone: DateUtils.AMSTERDAM_TIMEZONE }));
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