import Room from '../models/room.model.js';
import Property from '../models/property.model.js';

// @desc    Create a new room for a property
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, totalBeds, roomType, propertyId } = req.body;

    // Verify the property exists and belongs to the owner
    const property = await Property.findById(propertyId);
    if (!property || property.owner.toString() !== req.owner._id.toString()) {
      return res.status(404).json({ message: 'Property not found or you are not the owner' });
    }

    const room = await Room.create({
      roomNumber,
      floor,
      totalBeds,
      roomType,
      property: propertyId,
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all rooms for a specific property
// @route   GET /api/rooms?propertyId=<id>
// @access  Private
export const getRoomsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    // Optional: Verify property ownership before showing rooms
    const property = await Property.findById(propertyId);
    if (!property || property.owner.toString() !== req.owner._id.toString()) {
      return res.status(404).json({ message: 'Property not found or you are not the owner' });
    }

    const rooms = await Room.find({ property: propertyId });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};