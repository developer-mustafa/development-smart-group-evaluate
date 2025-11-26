import { useState } from 'react';
import GroupDetailModal from '../modals/GroupDetailModal';

export default function GroupCard({ group, onEdit, onDelete }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow duration-200">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 cursor-pointer" onClick={() => setShowDetail(true)}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {group.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <button
                  onClick={() => onEdit(group)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="সম্পাদনা"
                >
                  <i className="fa fa-edit"></i>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(group._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="মুছে ফেলুন"
                >
                  <i className="fa fa-trash"></i>
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 cursor-pointer" onClick={() => setShowDetail(true)}>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">সদস্য</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {group.memberCount || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">অবস্থা</div>
              <div className="text-xl font-bold">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  group.isActive 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {group.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <i className="fa fa-calendar mr-1"></i>
            তৈরি: {new Date(group.createdAt).toLocaleDateString('bn-BD')}
          </div>
        </div>
      </div>

      {showDetail && (
        <GroupDetailModal 
          group={group} 
          onClose={() => setShowDetail(false)} 
        />
      )}
    </>
  );
}
