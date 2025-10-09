"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const config_1 = require("../config/config");
class TelegramService {
    constructor() {
        if (!config_1.config.telegram.botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN is required but not provided in environment variables');
        }
        this.bot = new node_telegram_bot_api_1.default(config_1.config.telegram.botToken);
    }
    async postEvents(events, chatId, cityName) {
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
    createHeaderMessage(totalEvents, cityName) {
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
    createMessageChunks(events, cityName) {
        const messages = [];
        const maxLength = 3500; // Leave more buffer for Telegram's 4096 limit
        let currentMessage = this.createHeaderMessage(events.length, cityName);
        for (const event of events) {
            const eventText = this.formatSingleEvent(event);
            // Check if adding this event would exceed the limit
            if (currentMessage.length + eventText.length > maxLength) {
                // Save current message and start a new one
                messages.push(currentMessage);
                currentMessage = this.createContinuationHeader(cityName) + eventText;
            }
            else {
                currentMessage += eventText;
            }
        }
        // Add the last message if it has content
        if (currentMessage.length > 0) {
            messages.push(currentMessage);
        }
        return messages;
    }
    createContinuationHeader(cityName) {
        return `🤖 *${cityName.charAt(0).toUpperCase() + cityName.slice(1)} AI Events (continued)*\n\n`;
    }
    formatSingleEvent(event) {
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
    createCategoryMessage(category, events) {
        let message = '';
        events.forEach((event) => {
            message += this.formatSingleEvent(event);
        });
        return message;
    }
    async sendMessage(text, chatId) {
        try {
            await this.bot.sendMessage(chatId, text, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            });
            console.log('✅ Message sent successfully to Telegram');
        }
        catch (error) {
            console.error('❌ Failed to send Telegram message:', error);
            throw error; // Re-throw to fail the job
        }
    }
    getCategoryEmoji(category) {
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
    cleanEventTitle(title) {
        // Remove everything inside square brackets (including the brackets)
        return title.replace(/\[[^\]]*\]/g, '').trim();
    }
    escapeMarkdown(text) {
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.TelegramService = TelegramService;
//# sourceMappingURL=telegramService.js.map