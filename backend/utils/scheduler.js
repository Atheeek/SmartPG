import cron from 'node-cron';
import { generateDuesForAnniversaries } from '../services/payment.service.js';

export const startScheduler = () => {
  console.log('[SCHEDULER] Starting cron job for daily dues generation.');
  
  // This schedule runs the task every day at 1:00 AM server time.
  // cron format: (minute hour day-of-month month day-of-week)
  cron.schedule('0 1 * * *', async () => {
    console.log(`[CRON] Running daily dues generation task at ${new Date().toLocaleString()}`);
    try {
      const newDuesCount = await generateDuesForAnniversaries();
      console.log(`[CRON] Task finished. ${newDuesCount} new due records created.`);
    } catch (error) {
      console.error('[CRON] Error during scheduled dues generation:', error);
    }
  });

  // For testing, you can use this schedule to run the task every minute:
  // cron.schedule('* * * * *', () => { ... });
};