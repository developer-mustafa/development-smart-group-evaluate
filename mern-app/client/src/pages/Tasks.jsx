import { useState, useEffect } from 'react';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../services/api';
import { useSelector } from 'react-redux';

export default function Tasks() {
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    scheduledTime: '',
    status: 'upcoming',
    maxScoreBreakdown: {
      task: 20,
      team: 15,
      additional: 25,
      mcq: 40,
    },
    maxScore: 100,
  });

  const { data: tasksData, isLoading } = useGetTasksQuery();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const tasks = tasksData?.data || [];
  const canWrite = user?.permissions?.write || user?.permissions?.edit;
  const canDelete = user?.permissions?.delete;

  // Auto-calculate total max score when breakdown changes
  useEffect(() => {
    const { task, team, additional, mcq } = formData.maxScoreBreakdown;
    const total = Number(task) + Number(team) + Number(additional) + Number(mcq);
    setFormData((prev) => ({ ...prev, maxScore: total }));
  }, [formData.maxScoreBreakdown]);

  const handleBreakdownChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      maxScoreBreakdown: {
        ...prev.maxScoreBreakdown,
        [field]: Number(value),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        maxScore: Number(formData.maxScore),
      };

      if (editingTask) {
        await updateTask({ id: editingTask._id, ...payload }).unwrap();
      } else {
        await createTask(payload).unwrap();
      }
      setShowForm(false);
      setEditingTask(null);
      resetForm();
    } catch (error) {
      alert(error.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dueDate: '',
      scheduledTime: '',
      status: 'upcoming',
      maxScoreBreakdown: { task: 20, team: 15, additional: 25, mcq: 40 },
      maxScore: 100,
    });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      scheduledTime: task.scheduledTime || '',
      status: task.status || 'upcoming',
      maxScoreBreakdown: task.maxScoreBreakdown || { task: 0, team: 0, additional: 0, mcq: 0 },
      maxScore: task.maxScore || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteTask(id).unwrap();
    } catch (error) {
      alert(error.data?.message || 'Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">আপকামিং</span>;
      case 'ongoing': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">চলমান</span>;
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">সম্পন্ন</span>;
      default: return null;
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="loading-spinner"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            টাস্ক ম্যানেজমেন্ট
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            মোট টাস্ক: {tasks.length}
          </p>
        </div>
        {canWrite && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
            <i className="fa fa-plus mr-2"></i>নতুন টাস্ক
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingTask ? 'টাস্ক সম্পাদনা' : 'নতুন টাস্ক'}</h2>
              <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }} className="text-gray-400 hover:text-gray-600">
                <i className="fa fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">টাস্ক নাম *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" required />
              </div>
              
              <div>
                <label className="label">বিবরণ</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-input" rows="3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">তারিখ *</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="form-input" required />
                </div>
                <div>
                  <label className="label">সময় (ঐচ্ছিক)</label>
                  <input type="time" value={formData.scheduledTime} onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="label">স্ট্যাটাস</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="form-input">
                    <option value="upcoming">আপকামিং</option>
                    <option value="ongoing">চলমান</option>
                    <option value="completed">সম্পন্ন</option>
                  </select>
                </div>
              </div>

              <div className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <h3 className="font-semibold mb-3 text-sm uppercase text-gray-500">স্কোর ব্রেকডাউন</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label text-xs">টাস্ক</label>
                    <input type="number" min="0" value={formData.maxScoreBreakdown.task} onChange={(e) => handleBreakdownChange('task', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="label text-xs">টিম</label>
                    <input type="number" min="0" value={formData.maxScoreBreakdown.team} onChange={(e) => handleBreakdownChange('team', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="label text-xs">অতিরিক্ত</label>
                    <input type="number" min="0" value={formData.maxScoreBreakdown.additional} onChange={(e) => handleBreakdownChange('additional', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="label text-xs">MCQ</label>
                    <input type="number" min="0" value={formData.maxScoreBreakdown.mcq} onChange={(e) => handleBreakdownChange('mcq', e.target.value)} className="form-input" />
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">মোট স্কোর: {formData.maxScore}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }} className="btn btn-secondary flex-1">বাতিল</button>
              <button type="submit" className="btn btn-primary flex-1">{editingTask ? 'আপডেট' : 'তৈরি'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{task.name}</h3>
                  {getStatusBadge(task.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <i className="fa fa-calendar"></i>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('bn-BD') : 'N/A'}
                  </span>
                  {task.scheduledTime && (
                    <span className="flex items-center gap-1">
                      <i className="fa fa-clock"></i>
                      {task.scheduledTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                    <i className="fa fa-star"></i>
                    মোট স্কোর: {task.maxScore}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                )}

                <div className="flex gap-2 text-xs bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg w-fit">
                  <span title="Task Score">T: {task.maxScoreBreakdown?.task || 0}</span>
                  <span className="text-gray-300">|</span>
                  <span title="Team Score">Tm: {task.maxScoreBreakdown?.team || 0}</span>
                  <span className="text-gray-300">|</span>
                  <span title="Additional Score">A: {task.maxScoreBreakdown?.additional || 0}</span>
                  <span className="text-gray-300">|</span>
                  <span title="MCQ Score">M: {task.maxScoreBreakdown?.mcq || 0}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 min-w-fit">
                {canWrite && (
                  <button onClick={() => handleEdit(task)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="সম্পাদনা">
                    <i className="fa fa-edit"></i>
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => handleDelete(task._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="মুছে ফেলুন">
                    <i className="fa fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="card card-body text-center py-12">
          <i className="fa fa-tasks text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">কোনো টাস্ক নেই</p>
        </div>
      )}
    </div>
  );
}
