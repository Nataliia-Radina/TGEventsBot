"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const cron = __importStar(require("node-cron"));
class SchedulerService {
    constructor(eventsBot) {
        this.dailyJob = null;
        this.eventsBot = eventsBot;
    }
    startDailySchedule() {
        // Schedule to run every day at 9:00 AM
        // Cron format: minute hour day month dayOfWeek
        // 0 9 * * * = At 9:00 AM every day
        this.dailyJob = cron.schedule('0 9 * * *', async () => {
            console.log('🕘 Daily scheduled job started at 9:00 AM');
            try {
                await this.eventsBot.run();
                console.log('✅ Daily scheduled job completed successfully');
            }
            catch (error) {
                console.error('❌ Daily scheduled job failed:', error);
            }
        }, {
            timezone: 'Europe/Amsterdam' // Set timezone to Amsterdam
        });
        console.log('📅 Daily schedule started - will run at 9:00 AM Amsterdam time');
    }
    stopDailySchedule() {
        if (this.dailyJob) {
            this.dailyJob.stop();
            this.dailyJob = null;
            console.log('🛑 Daily schedule stopped');
        }
    }
    // For testing - run job every minute
    startTestSchedule() {
        this.dailyJob = cron.schedule('* * * * *', async () => {
            console.log('🧪 Test scheduled job started');
            try {
                await this.eventsBot.run();
                console.log('✅ Test scheduled job completed successfully');
            }
            catch (error) {
                console.error('❌ Test scheduled job failed:', error);
            }
        }, {
            timezone: 'Europe/Amsterdam'
        });
        console.log('🧪 Test schedule started - will run every minute');
    }
    getNextScheduledRun() {
        if (this.dailyJob) {
            // Get next execution time
            const nextRun = new Date();
            nextRun.setHours(9, 0, 0, 0);
            // If 9 AM today has passed, schedule for tomorrow
            if (nextRun.getTime() <= Date.now()) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            return nextRun.toLocaleString('en-US', {
                timeZone: 'Europe/Amsterdam',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return null;
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=schedulerService.js.map