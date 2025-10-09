"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const config_1 = require("../config/config");
const eventCategorizer_1 = require("../utils/eventCategorizer");
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
        const groupedEvents = eventCategorizer_1.EventCategorizer.groupByCategory(events);
        const sortedCategories = eventCategorizer_1.EventCategorizer.getSortedCategories();
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
    async sendMessage(text, chatId) {
        try {
            await this.bot.sendMessage(chatId, text, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            });
        }
        catch (error) {
            console.error('Error sending Telegram message:', error);
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