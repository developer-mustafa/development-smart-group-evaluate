import { Response } from 'express';
import { Evaluation } from '../models/Evaluation';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all evaluations
// @route   GET /api/evaluations
// @access  Private
// @desc    Get all evaluations
// @route   GET /api/evaluations
// @access  Private
export const getAllEvaluations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { task, group } = req.query;
    
    let query: any = {};
    
    if (task) query.task = task;
    if (group) query.group = group;

    const evaluations = await Evaluation.find(query)
      .populate('task', 'name maxScore')
      .populate('group', 'name')
      .populate('evaluatedBy', 'displayName')
      .sort({ evaluatedAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single evaluation
// @route   GET /api/evaluations/:id
// @access  Private
export const getEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('task')
      .populate('group')
      .populate('evaluatedBy', 'displayName email');

    if (!evaluation) {
      res.status(404).json({ success: false, message: 'Evaluation not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create evaluation (Group Batch)
// @route   POST /api/evaluations
// @access  Private (Admin only)
export const createEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { task, group, scores, studentCount, groupTotalScore, groupAverageScore, maxPossibleScore, comments } = req.body;

    // Check if evaluation already exists for this task and group
    const existingEvaluation = await Evaluation.findOne({ task, group });
    if (existingEvaluation) {
      res.status(400).json({ success: false, message: 'Evaluation already exists for this task and group' });
      return;
    }

    const evaluation = await Evaluation.create({
      task,
      group,
      scores,
      studentCount,
      groupTotalScore,
      groupAverageScore,
      maxPossibleScore,
      comments,
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private (Admin only)
export const updateEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!evaluation) {
      res.status(404).json({ success: false, message: 'Evaluation not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete evaluation
// @route   DELETE /api/evaluations/:id
// @access  Private (Admin only)
export const deleteEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);

    if (!evaluation) {
      res.status(404).json({ success: false, message: 'Evaluation not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get evaluations by member
// @route   GET /api/evaluations/member/:memberId
// @access  Private
export const getEvaluationsByMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find evaluations where the member exists in the scores map
    // Note: Querying keys in a Map in MongoDB is tricky. 
    // We might need to fetch all and filter, or use aggregate.
    // For now, let's try dot notation if keys are strings, but keys are dynamic.
    // Better to find by group (since member belongs to group) and then filter?
    // Or just use $exists check on the key? `scores.${memberId}`
    
    const evaluations = await Evaluation.find({
      [`scores.${req.params.memberId}`]: { $exists: true }
    })
      .populate('task', 'name maxScore maxScoreBreakdown')
      .populate('group', 'name')
      .sort({ evaluatedAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get evaluations by group
// @route   GET /api/evaluations/group/:groupId
// @access  Private
export const getEvaluationsByGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const evaluations = await Evaluation.find({ group: req.params.groupId })
      .populate('task', 'name maxScore maxScoreBreakdown')
      .sort({ evaluatedAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
