import express from 'express';
import {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  importMembersCSV,
  exportMembersCSV,
} from '../controllers/memberController';
import { protect } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = express.Router();

router.get('/', protect, getAllMembers);
router.get('/export-csv', protect, exportMembersCSV);
router.get('/:id', protect, getMember);
router.post('/', protect, checkPermission('write'), createMember);
router.post('/import-csv', protect, checkPermission('write'), importMembersCSV);
router.put('/:id', protect, checkPermission('edit'), updateMember);
router.delete('/:id', protect, checkPermission('delete'), deleteMember);

export default router;
