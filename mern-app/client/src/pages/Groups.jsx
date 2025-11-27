import { useState } from 'react';
import { useGetGroupsQuery, useCreateGroupMutation, useUpdateGroupMutation, useDeleteGroupMutation } from '../services/api';
import { useSelector } from 'react-redux';
import GroupCard from '../components/groups/GroupCard';
import GroupForm from '../components/groups/GroupForm';

export default function Groups() {
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: groupsData, isLoading, error } = useGetGroupsQuery();
  const [createGroup] = useCreateGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  const groups = groupsData?.data || [];
  const canWrite = user?.permissions?.write || user?.permissions?.edit;
  const canDelete = user?.permissions?.delete;

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data) => {
    try {
      await createGroup(data).unwrap();
      setShowForm(false);
    } catch (error) {
      alert(error.data?.message || 'Failed to create group');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateGroup({ id, ...data }).unwrap();
      setEditingGroup(null);
      setShowForm(false);
    } catch (error) {
      alert(error.data?.message || 'Failed to update group');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await deleteGroup(id).unwrap();
    } catch (error) {
      alert(error.data?.message || 'Failed to delete group');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card card-body">
        <p className="text-red-600">Error loading groups: {error.data?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            গ্রুপ ম্যানেজমেন্ট
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            মোট গ্রুপ: {groups.length}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => {
              setEditingGroup(null);
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            <i className="fa fa-plus mr-2"></i>
            নতুন গ্রুপ
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card card-body">
        <div className="relative">
          <i className="fa fa-search absolute left-3 top-3.5 text-gray-400"></i>
          <input
            type="text"
            placeholder="গ্রুপ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GroupForm
              group={editingGroup}
              onSubmit={(data) => {
                if (editingGroup) {
                  handleUpdate(editingGroup._id, data);
                } else {
                  handleCreate(data);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingGroup(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="card card-body text-center py-12">
          <i className="fa fa-layer-group text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'কোনো গ্রুপ পাওয়া যায়নি' : 'এখনো কোনো গ্রুপ তৈরি হয়নি'}
          </p>
          {canWrite && !searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary mt-4 mx-auto"
            >
              প্রথম গ্রুপ তৈরি করুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onEdit={canWrite ? (g) => {
                setEditingGroup(g);
                setShowForm(true);
              } : null}
              onDelete={canDelete ? handleDelete : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
