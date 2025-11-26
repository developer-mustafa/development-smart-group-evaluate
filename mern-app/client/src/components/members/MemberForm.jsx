


import { useState, useEffect } from 'react';
import { useGetGroupsQuery } from '../../services/api';

export default function MemberForm({ member, onSubmit, onCancel }) {
  const { data: groupsData } = useGetGroupsQuery();
  const groups = groupsData?.data || [];

  const [formData, setFormData] = useState({
    name: '',
    roll: '',
    email: '',
    gender: '',
    contact: '',
    academicGroup: '',
    session: '',
    role: '',
    groupId: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        roll: member.roll || '',
        email: member.email || '',
        gender: member.gender || '',
        contact: member.contact || '',
        academicGroup: member.academicGroup || '',
        session: member.session || '',
        role: member.role || '',
        groupId: member.groupId || member.group?._id || '',
        isActive: member.isActive !== undefined ? member.isActive : true,
      });
    }
  }, [member]);

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {member ? 'সদস্য সম্পাদনা' : 'নতুন সদস্য'}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <i className="fa fa-times"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="label">নাম *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            placeholder="শিক্ষার্থীর নাম"
            required
          />
        </div>

        <div>
          <label className="label">রোল নম্বর *</label>
          <input
            type="text"
            value={formData.roll}
            onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
            className="form-input"
            placeholder="যেমন: 101"
            required
          />
        </div>

        <div>
          <label className="label">ইমেইল</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
            placeholder="student@example.com"
          />
        </div>

        <div>
          <label className="label">মোবাইল নম্বর</label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            className="form-input"
            placeholder="017XXXXXXXX"
          />
        </div>

        <div>
          <label className="label">লিঙ্গ *</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="form-input"
            required
          >
            <option value="">নির্বাচন করুন</option>
            <option value="ছেলে">ছেলে</option>
            <option value="মেয়ে">মেয়ে</option>
          </select>
        </div>

        <div>
          <label className="label">বিভাগ (Group)</label>
          <select
            value={formData.academicGroup}
            onChange={(e) => setFormData({ ...formData, academicGroup: e.target.value })}
            className="form-input"
          >
            <option value="">নির্বাচন করুন</option>
            <option value="Science">Science</option>
            <option value="Arts">Arts</option>
            <option value="Commerce">Commerce</option>
          </select>
        </div>

        <div>
          <label className="label">সেশন</label>
          <input
            type="text"
            value={formData.session}
            onChange={(e) => setFormData({ ...formData, session: e.target.value })}
            className="form-input"
            placeholder="যেমন: 2023-24"
          />
        </div>

        <div>
          <label className="label">টিম রোল</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="form-input"
          >
            <option value="">নির্বাচন করুন</option>
            <option value="team-leader">Team Leader</option>
            <option value="time-keeper">Time Keeper</option>
            <option value="reporter">Reporter</option>
            <option value="resource-manager">Resource Manager</option>
            <option value="peace-maker">Peace Maker</option>
          </select>
        </div>

        <div>
          <label className="label">গ্রুপ</label>
          <select
            value={formData.groupId}
            onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
            className="form-input"
          >
            <option value="">গ্রুপ নির্বাচন করুন</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center pt-8">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            সক্রিয় সদস্য
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
          বাতিল
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'সংরক্ষণ হচ্ছে...' : (member ? 'আপডেট করুন' : 'তৈরি করুন')}
        </button>
      </div>
    </form>
  );
}
