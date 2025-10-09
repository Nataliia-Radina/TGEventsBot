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
      await this.sendMessage(`🔍 No ${cityName} AI events found for the next 7 days.`, chatId);
      return;
    }

    // Sort events by date
    const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Split events into chunks that fit Telegram's 4096 character limit
    const messages = this.createMessageChunks(sortedEvents, cityName);
    
    console.log(`📨 Splitting ${sortedEvents.length} events into ${messages.length} message(s)`);
    messages.forEach((msg, i) => {
      console.log(`📏 Message ${i + 1} length: ${msg.length} characters`);
    });

    // Send each message chunk
    for (let i = 0; i < messages.length; i++) {
      await this.sendMessage(messages[i], chatId);
      
      // Small delay between messages to avoid rate limits
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
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

    return `🤖 *${cityName.charAt(0).toUpperCase() + cityName.slice(1)} AI Events ${todayStr} - ${endStr}*\n\n`;
  }

  private createMessageChunks(events: ProcessedEvent[], cityName: string): string[] {
    const messages: string[] = [];
    const maxLength = 3500; // Leave more buffer for Telegram's 4096 limit
    
    let currentMessage = this.createHeaderMessage(events.length, cityName);
    
    for (const event of events) {
      const eventText = this.formatSingleEvent(event);
      
      // Check if adding this event would exceed the limit
      if (currentMessage.length + eventText.length > maxLength) {
        // Save current message and start a new one
        messages.push(currentMessage);
        currentMessage = this.createContinuationHeader(cityName) + eventText;
      } else {
        currentMessage += eventText;
      }
    }
    
    // Add the last message if it has content
    if (currentMessage.length > 0) {
      messages.push(currentMessage);
    }
    
    return messages;
  }

  private createContinuationHeader(cityName: string): string {
    return `🤖 *${cityName.charAt(0).toUpperCase() + cityName.slice(1)} AI Events (continued)*\n\n`;
  }

  private formatSingleEvent(event: ProcessedEvent): string {
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
    const categoryEmoji = this.getCategoryEmoji(event.category);
    
    let eventText = `📅 ${dateStr} — ${this.escapeMarkdown(cleanTitle)}\n`;
    eventText += `⏰ ${timeStr} • ${categoryEmoji} ${event.category}\n`;
    eventText += `📍 ${this.escapeMarkdown(event.location || event.city || 'Amsterdam')}\n`;
    eventText += `🔗 ${event.url}\n\n`;
    
    return eventText;
  }

  private createCategoryMessage(category: EventCategory, events: ProcessedEvent[]): string {
    let message = '';
    events.forEach((event) => {
      message += this.formatSingleEvent(event);
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

  private getCategoryEmoji(category: EventCategory): string {
    const categoryEmojis = {
      AI: '🤖',
      Product: '📦',
      Engineering: '⚡',
      Business: '💼',
      UX: '🎨',
      Lifestyle: '🏃',
      Other: '📌'
    };
    return categoryEmojis[category] || '📌';
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