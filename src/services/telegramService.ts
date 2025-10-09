import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/config';
import { ProcessedEvent, EventCategory } from '../types/events';
import { EventCategorizer } from '../utils/eventCategorizer';

export class TelegramService {
  private bot: TelegramBot;

  constructor() {
    if (!config.telegram.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required but not provided in environment variables');
    }
    this.bot = new TelegramBot(config.telegram.botToken);
  }

  async postEvents(events: ProcessedEvent[], chatId: string, cityName: string): Promise<void> {
    if (events.length === 0) {
      await this.sendMessage(`🔍 No ${cityName} events found for the next 7 days.`, chatId);
      return;
    }

    // Sort events by date
    const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Create single message with header and all events
    let message = this.createHeaderMessage(events.length, cityName);
    message += this.createCategoryMessage('Other', sortedEvents); // Using 'Other' as placeholder since we're not grouping by category

    await this.sendMessage(message, chatId);
  }

  private createHeaderMessage(totalEvents: number, cityName: string): string {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);

    const todayStr = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const endStr = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return `🚀 *${cityName.charAt(0).toUpperCase() + cityName.slice(1)} Tech Events ${todayStr} - ${endStr}*\n\n`;
  }

  private createCategoryMessage(category: EventCategory, events: ProcessedEvent[]): string {
    let message = '';

    events.forEach((event, index) => {
      const date = new Date(event.date);
      const dateStr = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
      });

      const cleanTitle = this.cleanEventTitle(event.title);
      
      message += `📅 ${dateStr} — ${this.escapeMarkdown(cleanTitle)}\n`;
      message += `⏰ ${timeStr} • 📝 ${this.escapeMarkdown(event.description ? event.description.substring(0, 100) + '...' : 'Event details')}\n`;
      message += `📍 ${this.escapeMarkdown(event.location || event.city || 'Amsterdam')}\n`;
      message += `🔗 ${event.url}\n\n`;
    });

    return message;
  }

  private async sendMessage(text: string, chatId: string): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
      console.log('✅ Message sent successfully to Telegram');
    } catch (error) {
      console.error('❌ Failed to send Telegram message:', error);
      throw error; // Re-throw to fail the job
    }
  }

  private cleanEventTitle(title: string): string {
    // Remove everything inside square brackets (including the brackets)
    return title.replace(/\[[^\]]*\]/g, '').trim();
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}