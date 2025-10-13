// In backend/services/payment.service.js
import { addMonths, isBefore, startOfToday } from 'date-fns';
import Tenant from '../models/tenant.model.js';
import Payment from '../models/payment.model.js';
import { sendSms } from './messaging.service.js';

export const generateDuesForAnniversaries = async () => {
  const today = startOfToday();
  const allActiveTenants = await Tenant.find({ isActive: true }).populate('bed');
  let newDuesCount = 0;

  console.log(`[DUES CHECK] Running daily dues check for ${today.toDateString()}`);

  for (const tenant of allActiveTenants) {
    // Find the most recent payment record for this tenant
    const lastPayment = await Payment.findOne({ tenant: tenant._id }).sort({ dueDate: -1 });

    // Determine the last date they were successfully billed for
    const lastBilledDate = lastPayment ? new Date(lastPayment.dueDate) : new Date(tenant.joiningDate);
    
    // Calculate the next due date
    let nextDueDate = addMonths(lastBilledDate, 1);

    // --- THIS IS THE NEW "CATCH-UP" LOGIC ---
    // Keep generating bills as long as the next due date is in the past or is today
    while (isBefore(nextDueDate, today) || nextDueDate.getTime() === today.getTime()) {
      const alreadyExists = await Payment.findOne({ tenant: tenant._id, dueDate: nextDueDate });

      if (!alreadyExists && tenant.bed) {
        // 1. Create the 'Due' record in the database
        await Payment.create({
          tenant: tenant._id,
          property: tenant.property,
          amount: tenant.bed.rentAmount,
          dueDate: nextDueDate,
          status: 'Due',
        });
        newDuesCount++;
        console.log(` -> Generated overdue/due bill for ${tenant.fullName} for date ${nextDueDate.toDateString()}`);

        // 2. Send the SMS reminder
        const messageBody = `Hi ${tenant.fullName}, your monthly rent of ₹${tenant.bed.rentAmount} due on ${nextDueDate.toLocaleDateString()} for PG-Pal is pending. Thank you.`;
        await sendSms(tenant.phone, messageBody);
      }
      
      // Move to the next month to check if they are overdue for that one too
      nextDueDate = addMonths(nextDueDate, 1);
    }
  }
  return newDuesCount;
};