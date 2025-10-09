// backend/controllers/property.controller.js
import mongoose from 'mongoose';
import Property from '../models/property.model.js';
import Room from '../models/room.model.js';     // <-- ADD THIS IMPORT
import Bed from '../models/bed.model.js';       // <-- AND ADD THIS IMPORT
import Tenant from '../models/tenant.model.js';
import Payment from '../models/payment.model.js'; // <-- AND ADD THIS IMPORT
import { addMonths ,endOfMonth ,startOfMonth } from 'date-fns';


// Add this new function to backend/controllers/property.controller.js

// @desc    Get dashboard statistics for the logged-in owner
// @route   GET /api/properties/stats
// @access  Private
// In backend/controllers/property.controller.js
// The final, fully corrected version for getDashboardStats
// In backend/controllers/property.controller.js

export const getDashboardStats = async (req, res) => {
  try {
    const { propertyId } = req.query;
    const ownerId = req.owner._id;

    let propertyFilter = { owner: ownerId };
    if (propertyId && propertyId !== 'all') {
      propertyFilter._id = propertyId;
    }

    const properties = await Property.find(propertyFilter);
    const propertyIds = properties.map(p => p._id);
    
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(today);

    const currentMonthPayments = await Payment.find({
      property: { $in: propertyIds },
      dueDate: { $gte: startDate, $lte: endDate },
    });

    const totalAmountReceived = currentMonthPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalDueAmount = currentMonthPayments.filter(p => p.status === 'Due').reduce((sum, p) => sum + p.amount, 0);

    const rooms = await Room.find({ property: { $in: propertyIds } });
    const roomIds = rooms.map(r => r._id);
    const beds = await Bed.find({ room: { $in: roomIds } }); // Fetches all beds once
    const activeTenants = await Tenant.countDocuments({ property: { $in: propertyIds }, isActive: true });
    
    // --- NEW, CLEARER CALCULATIONS ---
    const totalPotentialRevenue = beds.reduce((sum, bed) => sum + bed.rentAmount, 0);
    
    const currentMonthlyRevenue = beds
      .filter(b => b.status === 'Occupied')
      .reduce((sum, bed) => sum + bed.rentAmount, 0);
    // --- END OF NEW CALCULATIONS ---
      
    const totalProperties = properties.length;
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;

    res.json({
      totalProperties,
      totalTenants: activeTenants,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      currentMonthlyRevenue,   // Renamed for clarity
      totalPotentialRevenue,   // The new metric
      totalAmountReceived,
      totalDueAmount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (requires token)
export const createProperty = async (req, res) => {
  // ... this function is correct, no changes needed
  try {
    const { name, address } = req.body;
    const property = new Property({
      name,
      address,
      owner: req.owner._id,
    });
    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all properties for the logged-in owner
// @route   GET /api/properties
// @access  Private
export const getProperties = async (req, res) => {
  // ... this function is correct, no changes needed
  try {
    const properties = await Property.find({ owner: req.owner._id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get a single property with its rooms and beds (The fixed version)
// @route   GET /api/properties/:id/details
// @access  Private
export const getPropertyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid property ID format' });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.owner._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this property' });
    }

    const rooms = await Room.find({ property: id });
    const beds = await Bed.find({ room: { $in: rooms.map(r => r._id) } });

    res.json({ property, rooms, beds });
  } catch (error) {
    console.error("CRITICAL ERROR in getPropertyDetails:", error);
    res.status(500).json({ message: `An unexpected server error occurred.` });
  }
};

// Add this new function to backend/controllers/property.controller.js

// @desc    Bulk add rooms and beds to a property
// @route   POST /api/properties/:id/bulk-add
// @access  Private
export const bulkAddRoomsAndBeds = async (req, res) => {
  const { id: propertyId } = req.params;
  const { structure } = req.body; // Expecting a specific structure from the frontend

  // Start a MongoDB session for the transaction
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const createdRoomIds = [];

    // Loop through the structure provided by the frontend
    for (const floor of structure) {
      for (const room of floor.rooms) {
        // Create the Room
        const newRoom = new Room({
          roomNumber: room.roomNumber,
          floor: floor.floorNumber,
          totalBeds: room.bedCount,
          property: propertyId,
        });
        const savedRoom = await newRoom.save({ session });
        
        // Prepare beds for this room
        let bedsToCreate = [];
        for (let i = 1; i <= room.bedCount; i++) {
          bedsToCreate.push({
            bedNumber: String.fromCharCode(64 + i), // A, B, C...
            rentAmount: room.rent,
            room: savedRoom._id,
          });
        }

        if (bedsToCreate.length > 0) {
          await Bed.insertMany(bedsToCreate, { session });
        }
      }
    }

    // If all operations were successful, commit the transaction
    await session.commitTransaction();
    res.status(201).json({ message: 'Property structure created successfully.' });

  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    console.error("Bulk add failed:", error);
    res.status(500).json({ message: 'Failed to create property structure. Operation rolled back.' });
  } finally {
    // End the session
    session.endSession();
  }
};

// Add this to backend/controllers/property.controller.js
// Make sure 'startOfMonth', 'endOfMonth', 'startOfDay', 'endOfDay' are imported from 'date-fns'

// In backend/controllers/property.controller.js
export const getHistoricalStats = async (req, res) => {
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

        const properties = await Property.find(propertyFilter);
        const propertyIds = properties.map(p => p._id);

        // --- ALL CALCULATIONS NOW DERIVE FROM THIS SINGLE, CORRECT SOURCE ---
        const monthlyPayments = await Payment.find({
            property: { $in: propertyIds },
            dueDate: { $gte: startDate, $lte: endDate },
        });

        const amountCollectedInMonth = monthlyPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
        const amountDueInMonth = monthlyPayments.filter(p => p.status === 'Due').reduce((sum, p) => sum + p.amount, 0);

        // --- THIS IS THE FIX ---
        // "Expected Income" for the month is simply the sum of all bills due in that month.
        const expectedIncomeFromTenants = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // --- THE REST OF THE STATS ---
        const newTenantsInMonth = await Tenant.countDocuments({ property: { $in: propertyIds }, joiningDate: { $gte: startDate, $lte: endDate } });
        const vacatedTenantsInMonth = await Tenant.countDocuments({ property: { $in: propertyIds }, vacatedDate: { $gte: startDate, $lte: endDate } });
        const beds = await Bed.find({ room: { $in: await Room.find({ property: { $in: propertyIds } }).select('_id') } });
        const totalPotentialRevenue = beds.reduce((sum, bed) => sum + bed.rentAmount, 0);
        const totalAdvanceCollected = (await Tenant.aggregate([ { $match: { property: { $in: propertyIds }, joiningDate: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, total: { $sum: '$advancePaid' } } } ]))[0]?.total || 0;

        res.json({
            amountCollectedInMonth,
            amountDueInMonth,
            newTenantsInMonth,
            vacatedTenantsInMonth,
            expectedIncomeFromTenants, // Now correct
            totalPotentialRevenue,
            totalAdvanceCollected,
            totalBeds: beds.length,
            occupiedBeds: beds.filter(b => b.status === 'Occupied').length,
            availableBeds: beds.filter(b => b.status === 'Available').length,
            totalProperties: properties.length
        });

    } catch (error) {
        console.error("Error fetching historical stats:", error);
        res.status(500).json({ message: "Server Error" });
    }
};