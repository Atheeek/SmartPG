import mongoose from 'mongoose';
import Tenant from '../models/tenant.model.js';
import Bed from '../models/bed.model.js';
import Payment from '../models/payment.model.js';
import Property from '../models/property.model.js';
import { addMonths, isBefore, startOfToday, startOfMonth, endOfMonth } from 'date-fns';

// @desc    Create a new tenant and back-fill payments
// @route   POST /api/tenants
// @access  Private
export const createTenant = async (req, res) => {
  const { fullName, phone, email, joiningDate, advancePaid, bedId } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const bed = await Bed.findById(bedId).session(session);
    if (!bed) throw new Error('Bed not found');
    if (bed.status === 'Occupied') throw new Error('This bed is already occupied');

    const fullBedDetails = await Bed.findById(bedId).populate({ path: 'room', populate: { path: 'property' } });
    if (fullBedDetails.room.property.owner.toString() !== req.owner._id.toString()) {
      throw new Error('Not authorized');
    }

    const finalEmail = email === '' ? null : email;

    const tenantArray = await Tenant.create([{
      fullName, phone, email: finalEmail, joiningDate, advancePaid,
      bed: bedId,
      property: fullBedDetails.room.property._id,
    }], { session });
    const tenant = tenantArray[0];

    bed.status = 'Occupied';
    await bed.save({ session });

    const paymentsToCreate = [];
    let currentDueDate = new Date(joiningDate);
    const today = startOfToday();

    while (isBefore(currentDueDate, today) || currentDueDate.getTime() === today.getTime()) {
      paymentsToCreate.push({
        tenant: tenant._id,
        property: tenant.property,
        amount: bed.rentAmount,
        dueDate: new Date(currentDueDate),
        status: 'Due',
      });
      currentDueDate = addMonths(currentDueDate, 1);
    }
    
    if (paymentsToCreate.length > 0) {
      await Payment.insertMany(paymentsToCreate, { session });
    }

    await session.commitTransaction();
    res.status(201).json({ message: `Tenant created and ${paymentsToCreate.length} payment records generated.`, tenant });

  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.phone) {
        return res.status(400).json({ message: 'This phone number is already registered to another tenant.' });
      }
    }
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  } finally {
    session.endSession();
  }
};

// @desc    Get all active tenants for the owner (with aggregation)
// @route   GET /api/tenants/all
// @access  Private
// In backend/controllers/tenant.controller.js
export const getAllTenants = async (req, res) => {
  try {
    const { status } = req.query; // Get the status from the query parameter
    const ownerProperties = await Property.find({ owner: req.owner._id }).select('_id');
    const propertyIds = ownerProperties.map(p => p._id);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // --- THIS IS THE FIX ---
    // Dynamically set the isActive flag based on the query status
    const isActiveFilter = status === 'inactive' ? false : true;

    const tenants = await Tenant.aggregate([
      // The $match stage now uses our dynamic filter
      {
        $match: {
          property: { $in: propertyIds },
          isActive: isActiveFilter
        }
      },
      // ... the rest of the aggregation pipeline is exactly the same as before ...
      { $lookup: { from: 'beds', localField: 'bed', foreignField: '_id', as: 'bedInfo' } },
      { $lookup: { from: 'rooms', localField: 'bedInfo.room', foreignField: '_id', as: 'roomInfo' } },
      { $lookup: { from: 'properties', localField: 'property', foreignField: '_id', as: 'propertyInfo' } },
      { $lookup: { from: 'payments', let: { tenant_id: '$_id' }, pipeline: [ { $match: { $expr: { $eq: ['$tenant', '$$tenant_id'] }, dueDate: { $gte: startOfMonth, $lte: endOfMonth } } }, { $sort: { dueDate: -1 } }, { $limit: 1 } ], as: 'latestPayment' } },
      { $unwind: '$bedInfo' },
      { $unwind: '$roomInfo' },
      { $unwind: '$propertyInfo' },
      { $unwind: { path: '$latestPayment', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, fullName: 1, phone: 1, email: 1, joiningDate: 1, vacatedDate: 1, advancePaid: 1, property: { _id: '$propertyInfo._id', name: '$propertyInfo.name' }, bed: { _id: '$bedInfo._id', bedNumber: '$bedInfo.bedNumber', rentAmount: '$bedInfo.rentAmount', room: { _id: '$roomInfo._id', roomNumber: '$roomInfo.roomNumber', floor: '$roomInfo.floor' } }, latestPayment: { status: '$latestPayment.status' } } }
    ]);

    res.json(tenants);
  } catch (error) {
    console.error("Error fetching all tenants with aggregation:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get tenants for a specific property
// @route   GET /api/tenants?propertyId=<id>
// @access  Private
export const getTenantsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ message: 'Property ID is required' });
    const tenants = await Tenant.find({ property: propertyId, isActive: true }).populate({ path: 'bed', select: 'bedNumber rentAmount', populate: { path: 'room', select: 'roomNumber floor' } });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get full details for a single tenant
// @route   GET /api/tenants/:id/details
// @access  Private
export const getTenantDetails = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate({ path: 'bed', select: 'bedNumber rentAmount', populate: { path: 'room', select: 'roomNumber floor', populate: { path: 'property', select: 'name address owner' } } });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    if (!tenant?.bed?.room?.property?.owner) return res.status(400).json({ message: 'Property owner information is missing.' });
    if (tenant.bed.room.property.owner.toString() !== req.owner._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    const payments = await Payment.find({ tenant: req.params.id }).sort({ dueDate: -1 });
    res.json({ tenant, payments });
  } catch (error) {
    console.error("Error fetching tenant details:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Update a tenant's details
// @route   PUT /api/tenants/:id
// @access  Private
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const property = await Property.findById(tenant.property);
    if (property.owner.toString() !== req.owner._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    tenant.fullName = req.body.fullName || tenant.fullName;
    tenant.phone = req.body.phone || tenant.phone;
    tenant.email = req.body.email === '' ? null : req.body.email || tenant.email;
    tenant.advancePaid = req.body.advancePaid !== undefined ? req.body.advancePaid : tenant.advancePaid;
    const updatedTenant = await tenant.save();
    res.json(updatedTenant);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.phone) return res.status(400).json({ message: 'This phone number is already registered.' });
    console.error("Error updating tenant:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Vacate a tenant from a bed
// @route   PUT /api/tenants/:id/vacate
// @access  Private
export const vacateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    tenant.isActive = false;
        tenant.vacatedDate = new Date(); // <-- ADD THIS

    await tenant.save();
    await Bed.findByIdAndUpdate(tenant.bed, { status: 'Available' });
    res.json({ message: 'Tenant has been marked as vacated and bed is now available.' });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Transfer a tenant to a new bed
// @route   PUT /api/tenants/:id/transfer
// @access  Private
// In backend/controllers/tenant.controller.js

// In backend/controllers/tenant.controller.js

export const transferTenant = async (req, res) => {
  const tenantId = req.params.id; // <-- THE FIX IS HERE
  const { newBedId } = req.body;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const tenant = await Tenant.findById(tenantId).session(session);
    if (!tenant) throw new Error('Tenant not found');

    const oldBed = await Bed.findById(tenant.bed).session(session);
    const newBed = await Bed.findById(newBedId).session(session).populate('room');
    
    if (!newBed) throw new Error('New bed not found');
    if (newBed.status === 'Occupied') throw new Error('The selected new bed is already occupied.');
    
    if (oldBed) {
      oldBed.status = 'Available';
      await oldBed.save({ session });
    }
    newBed.status = 'Occupied';
    await newBed.save({ session });
    
    tenant.bed = newBedId;
    tenant.property = newBed.room.property;
    await tenant.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Tenant transferred successfully.' });

  } catch (error) {
    await session.abortTransaction();
    console.error("--- TENANT TRANSFER FAILED ---", error); 
    res.status(400).json({ message: error.message || 'Tenant transfer failed.' });
  } finally {
    session.endSession();
  }
};