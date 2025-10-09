import { addMonths } from 'date-fns';
import Tenant from '../models/tenant.model.js';
import Payment from '../models/payment.model.js';

// This is the core logic, now in its own function
export const generateDuesForAnniversaries = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allActiveTenants = await Tenant.find({ isActive: true }).populate('bed');
  let newDuesCount = 0;

  for (const tenant of allActiveTenants) {
    const joiningDate = new Date(tenant.joiningDate);
    joiningDate.setHours(0, 0, 0, 0);

    if (joiningDate.getDate() === today.getDate() && joiningDate.getTime() < today.getTime()) {
      const lastPayment = await Payment.findOne({ tenant: tenant._id }).sort({ dueDate: -1 });
      
      let nextDueDate;
      if (lastPayment) {
        nextDueDate = addMonths(new Date(lastPayment.dueDate), 1);
      } else {
        nextDueDate = addMonths(joiningDate, 1);
      }
      nextDueDate.setHours(0, 0, 0, 0);
      
      if (nextDueDate.getTime() === today.getTime()) {
        const alreadyExists = await Payment.findOne({ tenant: tenant._id, dueDate: today });
        
        if (!alreadyExists && tenant.bed) {
          await Payment.create({
            tenant: tenant._id,
            property: tenant.property,
            amount: tenant.bed.rentAmount,
            dueDate: today,
            status: 'Due',
          });
          newDuesCount++;
        }
      }
    }
  }
  return newDuesCount;
};