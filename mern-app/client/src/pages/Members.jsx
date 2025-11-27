import { useState } from 'react';
import { useGetMembersQuery, useCreateMemberMutation, useUpdateMemberMutation, useDeleteMemberMutation } from '../services/api';
import { useSelector } from 'react-redux';
import MemberTable from '../components/members/MemberTable';
import MemberForm from '../components/members/MemberForm';

export default function Members() {
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [filters, setFilters] = useState({ groupId: '', search: '' });

  const { data: membersData, isLoading } = useGetMembersQuery(filters);
  const [createMember] = useCreateMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();

  const members = membersData?.data || [];
  const canWrite = user?.permissions?.write || user?.permissions?.edit;
  const canDelete = user?.permissions?.delete;

  const handleCreate = async (data) => {
    try {
      await createMember(data).unwrap();
      setShowForm(false);
    } catch (error) {
      alert(error.data?.message || 'Failed to create member');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateMember({ id, ...data }).unwrap();
      setEditingMember(null);
      setShowForm(false);
    } catch (error) {
      alert(error.data?.message || 'Failed to update member');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await deleteMember(id).unwrap();
    } catch (error) {
      alert(error.data?.message || 'Failed to delete member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            সদস্য ম্যানেজমেন্ট
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            মোট সদস্য: {membersData?.count || 0}
          </p>
        </div>
        {canWrite && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <i className="fa fa-user-plus mr-2"></i>
            নতুন সদস্য
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <MemberForm
              member={editingMember}
              onSubmit={(data) => {
                if (editingMember) {
                  handleUpdate(editingMember._id, data);
                } else {
                  handleCreate(data);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingMember(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Members Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <MemberTable
          members={members}
          onEdit={canWrite ? (m) => {
            setEditingMember(m);
            setShowForm(true);
          } : null}
          onDelete={canDelete ? handleDelete : null}
        />
      )}
    </div>
  );
}
