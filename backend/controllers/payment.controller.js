import Payment from '../models/payment.model.js';
import Tenant from '../models/tenant.model.js';
import Bed from '../models/bed.model.js';
import Property from '../models/property.model.js';
import { addMonths ,endOfMonth ,startOfMonth } from 'date-fns';
import { generateDuesForAnniversaries } from '../services/payment.service.js';


// @desc    Generate monthly due records for all active tenants of a property
// @route   POST /api/payments/generate-dues
// @access  Private
// In backend/controllers/payment.controller.js

// In backend/controllers/payment.controller.js
// A TEMPORARY DIAGNOSTIC VERSION of the function
// A new, even more detailed diagnostic version
// The final, clean version
// At the top of backend/controllers/payment.controller.js

// ... other imports

// Replace the entire function with this new logic
export const generateMonthlyDues = async (req, res) => {
  try {
    console.log('[MANUAL TRIGGER] Running dues generation...');
    const newDuesCount = await generateDuesForAnniversaries();
    console.log(`[MANUAL TRIGGER] Finished. ${newDuesCount} new records created.`);
    res.status(201).json({ message: `Successfully generated ${newDuesCount} new due records for today's anniversaries.` });
  } catch (error) {
    console.error("Error generating manual dues:", error)
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};
// @desc    Get all payments with 'Due' status for a property
// @route   GET /api/payments/dues?propertyId=<id>
// @access  Private
// A more flexible version of the function
// In backend/controllers/payment.controller.js
// In backend/controllers/payment.controller.js
// In backend/controllers/payment.controller.js

// This is the only function we now need for the payments page.
export const getOutstandingPayments = async (req, res) => {
  try {
    const { propertyId } = req.query;
    const ownerId = req.owner._id;

    let propertyFilter = { owner: ownerId };
    if (propertyId && propertyId !== 'all') {
      propertyFilter._id = propertyId;
    }

    const ownerProperties = await Property.find(propertyFilter).select('_id');
    const propertyIds = ownerProperties.map(p => p._id);

    // THE FIX: Find ALL payments with status 'Due', and sort by the oldest date first.
    const duePayments = await Payment.find({
      property: { $in: propertyIds },
      status: 'Due'
    }).populate({
      path: 'tenant',
      select: 'fullName phone advancePaid',
      populate: {
        path: 'bed',
        select: 'bedNumber',
        populate: {
          path: 'room',
          select: 'roomNumber'
        }
      }
    }).sort({ dueDate: 'asc' }); // 'asc' means oldest due dates will be at the top

    res.json(duePayments);
  } catch (error) {
    console.error("Error fetching outstanding payments:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};
// @desc    Mark a specific payment record as 'Paid'
// @route   PUT /api/payments/:id/mark-paid
// @access  Private
// In backend/controllers/payment.controller.js
export const markAsPaid = async (req, res) => {
    try {
        console.log(`[PAID] Attempting to mark payment ${req.params.id} as paid.`);
        const payment = await Payment.findById(req.params.id).populate('tenant');

        if (!payment) {
            console.log('[PAID-ERROR] Payment record not found.');
            return res.status(404).json({ message: 'Payment record not found' });
        }
        
        // Ownership verification
        const property = await Property.findById(payment.tenant.property);
        if (property.owner.toString() !== req.owner._id.toString()) {
            console.log('[PAID-ERROR] Unauthorized attempt.');
            return res.status(401).json({ message: 'Not authorized' });
        }

        payment.status = 'Paid';
        payment.paymentDate = new Date();
        const updatedPayment = await payment.save(); // Ensure the change is saved

        console.log(`[PAID-SUCCESS] Successfully marked payment ${req.params.id} as paid.`);
        res.json({ message: 'Payment marked as paid successfully', payment: updatedPayment });

    } catch (error) {
        console.error("CRITICAL ERROR in markAsPaid:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};
// @desc    Get payment history for a single tenant
// @route   GET /api/payments/history?tenantId=<id>
// @access  Private
export const getTenantPaymentHistory = async (req, res) => {
    try {
        const { tenantId } = req.query;
        const payments = await Payment.find({ tenant: tenantId }).sort({ year: -1, month: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}

// In backend/controllers/payment.controller.js

export const getPaymentsForCurrentMonth = async (req, res) => {
  try {
    const { propertyId } = req.query;
    const ownerId = req.owner._id;

    // --- NEW LOGIC TO CALCULATE DATE RANGE ---
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(today);

    let propertyFilter = { owner: ownerId };
    if (propertyId && propertyId !== 'all') {
      propertyFilter._id = propertyId;
    }

    const ownerProperties = await Property.find(propertyFilter).select('_id');
    const propertyIds = ownerProperties.map(p => p._id);

    // This query now correctly uses dueDate
    const payments = await Payment.find({
      property: { $in: propertyIds },
      dueDate: {
        $gte: startDate, // Greater than or equal to the start of the month
        $lte: endDate,   // Less than or equal to the end of the month
      },
    }).populate({
      path: 'tenant',
      select: 'fullName phone advancePaid',
      populate: { path: 'bed', select: 'bedNumber', populate: { path: 'room', select: 'roomNumber' } }
    }).sort({ dueDate: 'asc' });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching current month payments:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};


// In backend/controllers/payment.controller.js
// Make sure 'startOfMonth' and 'endOfMonth' are imported from 'date-fns' at the top

// In backend/controllers/payment.controller.js

export const getPaymentsByMonth = async (req, res) => {
  try {
    const { propertyId, year, month } = req.query;
    const ownerId = req.owner._id;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required.' });
    }

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    let propertyFilter = { owner: ownerId };
    if (propertyId && propertyId !== 'all') {
      propertyFilter._id = propertyId;
    }
    
    const ownerProperties = await Property.find(propertyFilter).select('_id');
    const propertyIds = ownerProperties.map(p => p._id);

    // --- THIS IS THE CORRECTED SECTION ---
    const payments = await Payment.find({
      property: { $in: propertyIds },
      dueDate: { $gte: startDate, $lte: endDate },
    }).populate({
      path: 'tenant',
      select: 'fullName phone advancePaid',
      populate: {
        path: 'bed',
        select: 'bedNumber',
        populate: {
          path: 'room',
          select: 'roomNumber'
        }
      }
    }).sort({ createdAt: -1 });
    // --- END OF CORRECTION ---

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments by month:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};