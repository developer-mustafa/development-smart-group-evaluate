import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'displayName email')
      .sort({ dueDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'displayName email');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin only)
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, dueDate, scheduledTime, maxScore, maxScoreBreakdown, status } = req.body;

    // Validate that breakdown adds up to maxScore
    const breakdownTotal = Number(maxScoreBreakdown.task) + Number(maxScoreBreakdown.team) + Number(maxScoreBreakdown.additional) + Number(maxScoreBreakdown.mcq);
    if (breakdownTotal !== Number(maxScore)) {
      res.status(400).json({
        success: false,
        message: `Breakdown total (${breakdownTotal}) does not match max score (${maxScore})`,
      });
      return;
    }

    const task = await Task.create({
      name,
      description,
      dueDate,
      scheduledTime,
      maxScore,
      maxScoreBreakdown,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Admin only)
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { maxScore, maxScoreBreakdown } = req.body;

    // Validate breakdown if both are provided
    if (maxScore !== undefined && maxScoreBreakdown) {
      const breakdownTotal = Number(maxScoreBreakdown.task) + Number(maxScoreBreakdown.team) + Number(maxScoreBreakdown.additional) + Number(maxScoreBreakdown.mcq);
      if (breakdownTotal !== Number(maxScore)) {
        res.status(400).json({
          success: false,
          message: `Breakdown total (${breakdownTotal}) does not match max score (${maxScore})`,
        });
        return;
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Note: You might want to also delete associated evaluations
    // await Evaluation.deleteMany({ task: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get upcoming tasks
// @route   GET /api/tasks/upcoming
// @access  Private
export const getUpcomingTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      dueDate: { $gte: now },
    })
      .populate('createdBy', 'displayName email')
      .sort({ dueDate: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
