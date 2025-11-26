import { Response } from 'express';
import { Member } from '../models/Member';
import { Group } from '../models/Group';
import { AuthRequest } from '../middleware/auth';
import Papa from 'papaparse';

// @desc    Get all members
// @route   GET /api/members
// @access  Private
export const getAllMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { group, academicGroup, search } = req.query;
    
    let query: any = {};
    
    if (group) {
      query.group = group;
    }
    
    if (academicGroup && academicGroup !== 'all') {
      query.academicGroup = academicGroup;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roll: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(query)
      .populate('group', 'name')
      .sort({ roll: 1 });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
export const getMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await Member.findById(req.params.id).populate('group', 'name');

    if (!member) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create member
// @route   POST /api/members
// @access  Private (Admin only)
export const createMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, roll, gender, group, contact, academicGroup, session, role } = req.body;

    const member = await Member.create({
      name,
      roll,
      gender,
      group,
      contact,
      academicGroup,
      session,
      role,
    });

    // Add member to group if group is specified
    if (group) {
      await Group.findByIdAndUpdate(group, {
        $addToSet: { members: member._id },
      });
    }

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private (Admin only)
export const updateMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const oldMember = await Member.findById(req.params.id);
    if (!oldMember) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update group memberships if group changed
    if (req.body.group && req.body.group !== oldMember.group?.toString()) {
      // Remove from old group
      if (oldMember.group) {
        await Group.findByIdAndUpdate(oldMember.group, {
          $pull: { members: member!._id },
        });
      }
      // Add to new group
      await Group.findByIdAndUpdate(req.body.group, {
        $addToSet: { members: member!._id },
      });
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin only)
export const deleteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }

    // Remove member from group
    if (member.group) {
      await Group.findByIdAndUpdate(member.group, {
        $pull: { members: member._id },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Import members from CSV
// @route   POST /api/members/import-csv
// @access  Private (Admin only)
export const importMembersCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      res.status(400).json({ success: false, message: 'CSV data is required' });
      return;
    }

    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    const members = parsed.data as any[];

    const createdMembers = [];
    const errors = [];

    for (const [index, row] of members.entries()) {
      try {
        // Find or create group if specified
        let groupId = null;
        if (row.group) {
          let group = await Group.findOne({ name: row.group });
          if (!group) {
            group = await Group.create({
              name: row.group,
              members: [],
              createdBy: req.user._id,
            });
          }
          groupId = group._id;
        }

        const member = await Member.create({
          name: row.name,
          roll: row.roll,
          gender: row.gender,
          group: groupId,
          contact: row.contact,
          academicGroup: row.academicGroup,
          session: row.session,
          role: row.role || '',
        });

        // Add to group
        if (groupId) {
          await Group.findByIdAndUpdate(groupId, {
            $addToSet: { members: member._id },
          });
        }

        createdMembers.push(member);
      } catch (error: any) {
        errors.push({ row: index + 1, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        imported: createdMembers.length,
        errors: errors.length,
        details: errors,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export members to CSV
// @route   GET /api/members/export-csv
// @access  Private
export const exportMembersCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const members = await Member.find().populate('group', 'name').lean();

    const csvData = members.map((member: any) => ({
      name: member.name,
      roll: member.roll,
      gender: member.gender,
      group: member.group?.name || '',
      contact: member.contact || '',
      academicGroup: member.academicGroup,
      session: member.session,
      role: member.role || '',
    }));

    const csv = Papa.unparse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
