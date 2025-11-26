import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getUpcomingTasks,
} from '../controllers/taskController';
import { protect } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = express.Router();

router.get('/upcoming', protect, getUpcomingTasks);
router.get('/', protect, getAllTasks);
router.get('/:id', protect, getTask);
router.post('/', protect, checkPermission('write'), createTask);
router.put('/:id', protect, checkPermission('edit'), updateTask);
router.delete('/:id', protect, checkPermission('delete'), deleteTask);

export default router;
