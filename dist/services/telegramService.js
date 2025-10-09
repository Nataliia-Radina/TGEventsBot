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
        return `🚀 *${cityName.charAt(0).toUpperCase() + cityName.slice(1)} Tech Events ${todayStr} - ${endStr}*\n\n`;
    }
    createCategoryMessage(category, events) {
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