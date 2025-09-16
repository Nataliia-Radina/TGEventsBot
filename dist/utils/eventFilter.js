"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventFilter = void 0;
const config_1 = require("../config/config");
class EventFilter {
    static filterNext7Days(events) {
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + config_1.config.daysAhead);
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= endDate;
        });
    }
    static processEvents(events) {
        return events.map(event => ({
            ...event,
            category: 'Other',
            formattedDate: this.formatDate(event.date),
            isNext7Days: this.isNext7Days(event),
        }));
    }
    static isNext7Days(event) {
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + config_1.config.daysAhead);
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= endDate;
    }
    static formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}
exports.EventFilter = EventFilter;
//# sourceMappingURL=eventFilter.js.map