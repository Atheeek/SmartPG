import Owner from '../models/owner.model.js';

// @desc    Get all owner accounts
// @route   GET /api/admin/owners
// @access  SuperAdmin
export const getAllOwners = async (req, res) => {
    try {
        const owners = await Owner.find({}).select('-password').sort({ createdAt: -1 });
        res.json(owners);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


// Add this to backend/controllers/admin.controller.js
export const updateOwnerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }
        const owner = await Owner.findById(req.params.id);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }
        owner.status = status;
        await owner.save();
        res.json({ message: `Owner status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};