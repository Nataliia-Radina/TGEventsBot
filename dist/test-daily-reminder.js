"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dailyReminderService_1 = require("./services/dailyReminderService");
// Test version that allows testing different scenarios
class TestDailyReminderService extends dailyReminderService_1.DailyReminderService {
    // Override the filterTodaysEvents method to test different dates
    testFilterEventsForDate(events, testDate) {
        const dayStart = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        console.log(`🧪 Testing events for: ${testDate.toDateString()}`);
        console.log(`🕐 Day range: ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            const isToday = eventDate >= dayStart && eventDate < dayEnd;
            if (isToday) {
                console.log(`✅ Event matches: ${event.title} at ${eventDate.toISOString()}`);
            }
            return isToday;
        });
        console.log(`📊 Found ${filteredEvents.length} events for ${testDate.toDateString()}`);
        return filteredEvents;
    }
    // Test method to run with different scenarios
    async testDifferentScenarios() {
        console.log('🧪 Testing Daily Reminder with different scenarios...\n');
        try {
            // Test 1: Run normal daily reminder
            console.log('📅 Test 1: Normal daily reminder for today');
            await this.sendTodaysEvents();
            console.log('\n✅ Test 1 completed\n');
        }
        catch (error) {
            console.error('❌ Test failed:', error);
        }
    }
}
async function runTests() {
    try {
        console.log('🧪 Starting Daily Reminder Tests...\n');
        const testService = new TestDailyReminderService();
        await testService.testDifferentScenarios();
        console.log('✅ All tests completed successfully');
    }
    catch (error) {
        console.error('❌ Tests failed:', error);
        process.exit(1);
    }
}
// Run the tests
runTests().catch(console.error);
//# sourceMappingURL=test-daily-reminder.js.map