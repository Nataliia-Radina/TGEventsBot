"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dailyReminderService_1 = require("./services/dailyReminderService");
async function sendDailyReminder() {
    try {
        console.log('🌅 Starting daily events reminder...');
        const reminderService = new dailyReminderService_1.DailyReminderService();
        await reminderService.sendTodaysEvents();
        console.log('✅ Daily events reminder completed successfully');
    }
    catch (error) {
        console.error('❌ Daily events reminder failed:', error);
        process.exit(1);
    }
}
// Run the daily reminder
sendDailyReminder().catch(console.error);
//# sourceMappingURL=daily-reminder.js.map