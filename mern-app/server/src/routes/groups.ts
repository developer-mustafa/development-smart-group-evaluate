import express from 'express';
import {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
} from '../controllers/groupController';
import { protect } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = express.Router();

router.get('/', protect, getAllGroups);
router.get('/:id', protect, getGroup);
router.post('/', protect, checkPermission('write'), createGroup);
router.put('/:id', protect, checkPermission('edit'), updateGroup);
router.delete('/:id', protect, checkPermission('delete'), deleteGroup);
router.get('/:id/members', protect, getGroupMembers);

export default router;
