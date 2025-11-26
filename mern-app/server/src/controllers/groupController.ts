import { Response } from 'express';
import { Group } from '../models/Group';
import { Member } from '../models/Member';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
export const getAllGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groups = await Group.find()
      .populate('members', 'name roll')
      .populate('createdBy', 'displayName email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name roll gender academicGroup session role')
      .populate('createdBy', 'displayName email');

    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create group
// @route   POST /api/groups
// @access  Private (Admin only)
export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    const group = await Group.create({
      name,
      members: [],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Admin only)
export const updateGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, members } = req.body;

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { name, members },
      { new: true, runValidators: true }
    );

    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (Admin only)
export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    // Remove group reference from members
    await Member.updateMany(
      { group: req.params.id },
      { $unset: { group: 1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get group members
// @route   GET /api/groups/:id/members
// @access  Private
export const getGroupMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id).populate('members');

    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: group.members,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
