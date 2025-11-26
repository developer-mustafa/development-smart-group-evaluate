import express from 'express';
import {
  getAllEvaluations,
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationsByMember,
  getEvaluationsByGroup,
} from '../controllers/evaluationController';
import { protect } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = express.Router();

router.get('/', protect, getAllEvaluations);
router.get('/member/:memberId', protect, getEvaluationsByMember);
router.get('/group/:groupId', protect, getEvaluationsByGroup);
router.get('/:id', protect, getEvaluation);
router.post('/', protect, checkPermission('write'), createEvaluation);
router.put('/:id', protect, checkPermission('edit'), updateEvaluation);
router.delete('/:id', protect, checkPermission('delete'), deleteEvaluation);

export default router;
