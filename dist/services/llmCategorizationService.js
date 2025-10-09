"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMCategorizationService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config/config");
class LLMCategorizationService {
    constructor() {
        if (!config_1.config.openai.apiKey) {
            throw new Error('OPENAI_API_KEY is required but not provided in environment variables');
        }
        this.openai = new openai_1.default({
            apiKey: config_1.config.openai.apiKey,
        });
    }
    async categorizeEvent(event) {
        try {
            const prompt = this.createPrompt(event);
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert event categorizer for tech events. Categorize each event into exactly one of these categories:

            - AI: Artificial intelligence, machine learning, data science, LLMs, neural networks, AGI
            - Product: Product management, product strategy, roadmaps, product owners
            - Engineering: Software development, programming, frameworks, technical talks, coding, javascript, java, php, python, databases, infrastructure
            - Business: Startups, entrepreneurship, indie hacking, funding, business strategy, marketing, sales, founders
            - UX: User experience, user interface, design, prototyping, usability, graphics
            - Lifestyle: food, sports, wellness, community gatherings, casual meetups, music
            - Other: Everything else that doesn't fit the above categories

            Respond with only the category name (AI, Product, Engineering, Business, UX, Lifestyle, or Other).`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: config_1.config.llm.maxTokens,
                temperature: config_1.config.llm.temperature,
            });
            const category = response.choices[0]?.message?.content?.trim();
            // Validate the response
            const validCategories = ['AI', 'Product', 'Engineering', 'Business', 'UX', 'Lifestyle', 'Other'];
            if (validCategories.includes(category)) {
                return category;
            }
            else {
                console.warn(`Invalid category returned by LLM: ${category}. Defaulting to 'Other'.`);
                return 'Other';
            }
        }
        catch (error) {
            console.error('Error categorizing event with LLM:', error);
            return 'Other';
        }
    }
    createPrompt(event) {
        const parts = [];
        if (event.title) {
            parts.push(`Event Title: ${event.title}`);
        }
        if (event.org) {
            parts.push(`Organizing Group: ${event.org}`);
        }
        if (event.description && event.description.length > 0) {
            // Truncate description to avoid token limits
            const truncatedDescription = event.description.length > config_1.config.llm.maxDescriptionLength
                ? event.description.substring(0, config_1.config.llm.maxDescriptionLength) + '...'
                : event.description;
            parts.push(`Event Description: ${truncatedDescription}`);
        }
        return parts.join('\n\n');
    }
    async categorizeEventsBatch(events) {
        const categorizedEvents = [];
        // Process events in small batches to avoid rate limits
        const batchSize = config_1.config.llm.batchSize;
        for (let i = 0; i < events.length; i += batchSize) {
            const batch = events.slice(i, i + batchSize);
            const batchPromises = batch.map(async (event) => {
                const category = await this.categorizeEvent(event);
                return { ...event, category };
            });
            const batchResults = await Promise.all(batchPromises);
            categorizedEvents.push(...batchResults);
            // Small delay between batches to respect rate limits
            if (i + batchSize < events.length) {
                await new Promise(resolve => setTimeout(resolve, config_1.config.delays.betweenLlmBatches));
            }
        }
        return categorizedEvents;
    }
}
exports.LLMCategorizationService = LLMCategorizationService;
//# sourceMappingURL=llmCategorizationService.js.map