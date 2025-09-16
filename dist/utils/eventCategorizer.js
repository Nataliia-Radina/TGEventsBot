"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventCategorizer = void 0;
const llmCategorizationService_1 = require("../services/llmCategorizationService");
class EventCategorizer {
    static async categorizeEvents(events) {
        console.log('🤖 Categorizing events with LLM...');
        return await this.llmService.categorizeEventsBatch(events);
    }
    static groupByCategory(events) {
        const grouped = new Map();
        events.forEach(event => {
            const category = event.category;
            if (!grouped.has(category)) {
                grouped.set(category, []);
            }
            grouped.get(category).push(event);
        });
        return grouped;
    }
    static getSortedCategories() {
        return ['AI', 'Product', 'Engineering', 'Business', 'UX', 'Lifestyle', 'Other'];
    }
}
exports.EventCategorizer = EventCategorizer;
EventCategorizer.llmService = new llmCategorizationService_1.LLMCategorizationService();
//# sourceMappingURL=eventCategorizer.js.map