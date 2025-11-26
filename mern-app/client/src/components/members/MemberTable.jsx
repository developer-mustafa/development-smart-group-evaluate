import { useState } from 'react';
import StudentDetailModal from '../modals/StudentDetailModal';

export default function MemberTable({ members, onEdit, onDelete }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (members.length === 0) {
    return (
      <div className="card card-body text-center py-12">
        <i className="fa fa-users text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p className="text-gray-500 dark:text-gray-400">কোনো সদস্য পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  ইমেইল
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  রোল
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  গ্রুপ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                {(onEdit || onDelete) && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedStudent(member)}
                      className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 text-left"
                    >
                      {member.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {member.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-mono font-semibold">{member.roll || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {member.group?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {member.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(member)}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(member._id)}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </>
  );
}
