export declare const config: {
    cities: {
        cityName: string;
        country: string;
        chatId: string;
    }[];
    apify: {
        token: string;
        meetupActorId: string;
        lumaActorId: string;
        timeout: number;
    };
    telegram: {
        botToken: string;
        chatId: string;
    };
    openai: {
        apiKey: string | undefined;
    };
    defaultFilters: {
        maxResults: number;
        scrapeActualAttendeesCount: boolean;
        scrapeEventAddress: boolean;
        scrapeEventDate: boolean;
        scrapeEventDescription: boolean;
        scrapeEventName: boolean;
        scrapeEventType: boolean;
        scrapeEventUrl: boolean;
        scrapeHostedByGroup: boolean;
        scrapeMaxAttendees: boolean;
        eventType: string;
        searchKeyword: string;
        state: string;
    };
    daysAhead: number;
    categories: {
        UX: string[];
        Product: string[];
        AI: string[];
        Lifestyle: string[];
        Business: string[];
        Engineering: string[];
    };
};
export declare function validateConfig(): boolean;
//# sourceMappingURL=config.d.ts.map