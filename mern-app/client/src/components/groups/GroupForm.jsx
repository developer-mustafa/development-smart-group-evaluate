import { useState, useEffect } from 'react';

export default function GroupForm({ group, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        isActive: group.isActive !== undefined ? group.isActive : true,
      });
    }
  }, [group]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Header */}
      <div className=" flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {group ? 'গ্রুপ সম্পাদনা' : 'নতুন গ্রুপ'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <i className="fa fa-times"></i>
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="label">গ্রুপের নাম *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            placeholder="যেমন: Group A"
            required
          />
        </div>

        <div>
          <label className="label">বিবরণ</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-input"
            rows="3"
            placeholder="গ্রুপ সম্পর্কে বিস্তারিত লিখুন..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            সক্রিয় গ্রুপ
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          বাতিল
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'সংরক্ষণ হচ্ছে...' : (group ? 'আপডেট করুন' : 'তৈরি করুন')}
        </button>
      </div>
    </form>
  );
}
