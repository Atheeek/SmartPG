import Bed from '../models/bed.model.js';
import Room from '../models/room.model.js';
import Tenant from '../models/tenant.model.js';


// @desc    Create a new bed in a room
// @route   POST /api/beds
// @access  Private
export const createBed = async (req, res) => {
  try {
    const { bedNumber, rentAmount, roomId } = req.body;

    // 1. Find the room to ensure it exists
    const room = await Room.findById(roomId).populate('property');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // 2. Crucial: Verify the room's property belongs to the logged-in owner
    if (room.property.owner.toString() !== req.owner._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to add beds to this property' });
    }

    // 3. Create the bed
    const bed = await Bed.create({
      bedNumber,
      rentAmount,
      room: roomId,
    });

    res.status(201).json(bed);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all beds for a specific room
// @route   GET /api/beds?roomId=<id>
// @access  Private
export const getBedsByRoom = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Optional but recommended: Verify ownership of the room before showing beds
    const room = await Room.findById(roomId).populate('property');
    if (!room || room.property.owner.toString() !== req.owner._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view these beds' });
    }

    const beds = await Bed.find({ room: roomId });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// At the top of backend/controllers/bed.controller.js

// ... other functions like createBed, getBedsByRoom ...

// ADD THIS NEW FUNCTION AT THE BOTTOM
// @desc    Reset status of occupied beds that have no active tenant
// @route   POST /api/beds/reset-statuses
// @access  Private
export const resetOrphanedBeds = async (req, res) => {
  try {
    // 1. Find the IDs of all beds that are currently assigned to an ACTIVE tenant
    const activeTenants = await Tenant.find({ isActive: true }).select('bed');
    const assignedBedIds = activeTenants.map(t => t.bed);

    // 2. Find all beds that are marked 'Occupied' BUT are NOT in the list of actively assigned beds
    const result = await Bed.updateMany(
      { 
        status: 'Occupied', 
        _id: { $nin: assignedBedIds } // $nin means "not in"
      },
      { $set: { status: 'Available' } }
    );

    res.json({ 
      message: 'Bed statuses reset successfully.', 
      bedsReset: result.modifiedCount 
    });

  } catch (error) {
    console.error("Error resetting bed statuses:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Add these two new functions to backend/controllers/bed.controller.js

// @desc    Update a bed's details (e.g., rent)
// @route   PUT /api/beds/:id
// @access  Private
export const updateBed = async (req, res) => {
  try {
    const { rentAmount } = req.body;
    const bed = await Bed.findById(req.params.id).populate({ path: 'room', populate: { path: 'property' } });

    if (!bed) return res.status(404).json({ message: 'Bed not found' });
    if (bed.room.property.owner.toString() !== req.owner._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    bed.rentAmount = rentAmount || bed.rentAmount;
    const updatedBed = await bed.save();
    res.json(updatedBed);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Delete a bed
// @route   DELETE /api/beds/:id
// @access  Private
export const deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id).populate({ path: 'room', populate: { path: 'property' } });

    if (!bed) return res.status(404).json({ message: 'Bed not found' });
    if (bed.room.property.owner.toString() !== req.owner._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    // IMPORTANT: Prevent deleting an occupied bed
    if (bed.status === 'Occupied') {
      return res.status(400).json({ message: 'Cannot delete an occupied bed. Please vacate the tenant first.' });
    }

    await bed.deleteOne();
    res.json({ message: 'Bed removed successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// In backend/controllers/bed.controller.js

// @desc    Get all available beds for a property
// @route   GET /api/beds/available
// @access  Private
export const getAvailableBeds = async (req, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    const rooms = await Room.find({ property: propertyId }).select('_id');
    const roomIds = rooms.map(r => r._id);

    const availableBeds = await Bed.find({ 
      room: { $in: roomIds }, 
      status: 'Available' 
    }).populate('room', 'roomNumber floor');
    
    res.json(availableBeds);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};