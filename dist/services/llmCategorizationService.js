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
                        content: `You are an expert event categorizer for AI-related events. Categorize each AI-related event into exactly one of these categories:

            - AI: Core AI/ML topics - artificial intelligence, machine learning, deep learning, neural networks, LLMs, AGI, data science, computer vision, NLP, generative AI, AI research, Model Context Protocol (MCP), AI security, AI safety, AI protocols
            - Product: AI product management, AI product strategy, AI product development, building AI products, AI product roadmaps, AI-powered products  
            - Engineering: AI/ML engineering, building AI systems, AI infrastructure, AI tools development, prompt engineering, AI model development, MLOps, AI software development, programming languages (PHP, Python, Java, Kafka, etc.)
            - Business: AI startups, AI entrepreneurship, AI business strategy, AI funding, AI market opportunities, AI business applications, AI consulting
            - UX: AI UX design, designing for AI products, AI-assisted design, AI art, AI drawing tools, generative design, AI creative tools, human-AI interaction design
            - Lifestyle: AI community events, AI networking, AI discussions, AI philosophy, AI ethics discussions, casual AI meetups
            - Other: AI-related events that don't fit the above categories

            IMPORTANT: Respond with ONLY the category name. Examples:
            - For "AmsterdamPHP Monthly Meeting" → Engineering
            - For "AI Hackday Amsterdam" → AI
            - For "Apache Kafka x WarpStream" → Engineering
            - For "Model Context Protocol Risks and Security Requirements" → AI
            
            Your response must be exactly one word: AI, Product, Engineering, Business, UX, Lifestyle, or Other.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: config_1.config.llm.maxTokens,
                temperature: config_1.config.llm.temperature,
            });
            let category = response.choices[0]?.message?.content?.trim() || 'Other';
            console.log(`🤖 LLM Raw response for "${event.title}": "${category}"`);
            // Clean up the response - extract just the category name
            // Handle cases like "AI: Core AI/ML topics" -> "AI"
            const categoryMatch = category.match(/^(AI|Product|Engineering|Business|UX|Lifestyle|Other)/i);
            if (categoryMatch) {
                category = categoryMatch[1];
                console.log(`🤖 Extracted category: "${category}"`);
            }
            // Normalize case
            category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
            // Special case for AI (should be uppercase)
            if (category.toLowerCase() === 'ai') {
                category = 'AI';
            }
            if (category.toLowerCase() === 'ux') {
                category = 'UX';
            }
            console.log(`🤖 Final category for "${event.title}": "${category}"`);
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