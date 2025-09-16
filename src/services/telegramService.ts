import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/config';
import { ProcessedEvent, EventCategory } from '../types/events';
import { EventCategorizer } from '../utils/eventCategorizer';

export class TelegramService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken);
  }

  async postEvents(events: ProcessedEvent[], chatId: string, cityName: string): Promise<void> {
    if (events.length === 0) {
      await this.sendMessage(`🔍 No ${cityName} events found for the next 7 days.`, chatId);
      return;
    }

    const groupedEvents = EventCategorizer.groupByCategory(events);
    const sortedCategories = EventCategorizer.getSortedCategories();

    // Create single message with header and all categories
    let message = this.createHeaderMessage(events.length, cityName);

    for (const category of sortedCategories) {
      const categoryEvents = groupedEvents.get(category);
      if (categoryEvents && categoryEvents.length > 0) {
        message += this.createCategoryMessage(category, categoryEvents);
      }
    }

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
    const categoryEmojis = {
      AI: '🤖',
      Product: '📦',
      Engineering: '⚡',
      Business: '💼',
      UX: '🎨',
      Lifestyle: '🏃',
      Other: '📌'
    };

    let message = `${categoryEmojis[category]} *${category.toUpperCase()}*\n`;

    events.forEach((event, index) => {
      const date = new Date(event.date);
      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
      });

      const cleanTitle = this.cleanEventTitle(event.title);
      message += `${dateStr} ${timeStr} • [${this.escapeMarkdown(cleanTitle)}](${event.url})\n`;
    });

    message += '\n';
    return message;
  }

  private async sendMessage(text: string, chatId: string): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.error('Error sending Telegram message:', error);
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