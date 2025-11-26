import { useState, useMemo } from 'react';
import { useGetMembersQuery, useGetGroupsQuery, useGetEvaluationsQuery, useGetTasksQuery } from '../services/api';

export default function StudentFilter() {
  const [filters, setFilters] = useState({
    groupId: '',
    minScore: '',
    maxScore: '',
    taskId: '',
    search: '',
  });

  const { data: membersData } = useGetMembersQuery({});
  const { data: groupsData } = useGetGroupsQuery();
  const { data: evaluationsData } = useGetEvaluationsQuery();
  const { data: tasksData } = useGetTasksQuery();

  const members = membersData?.data || [];
  const groups = groupsData?.data || [];
  const evaluations = evaluationsData?.data || [];
  const tasks = tasksData?.data || [];

  const filteredStudents = useMemo(() => {
    return members.filter(member => {
      // Group Filter
      if (filters.groupId && (member.group?._id || member.group) !== filters.groupId) {
        return false;
      }

      // Search Filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!member.name.toLowerCase().includes(searchLower) && 
            !member.roll?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Score Filter (requires Task selection)
      if (filters.taskId && (filters.minScore || filters.maxScore)) {
        const memberEval = evaluations.find(e => 
          (e.member?._id === member._id || e.member === member._id) && 
          (e.task?._id === filters.taskId || e.task === filters.taskId)
        );

        const score = memberEval ? memberEval.totalScore : 0; // Assuming totalScore is calculated or available
        // Note: Evaluation model has 'scores' map. We need to calculate total from that if not directly available.
        // Actually, the Evaluation model in backend has 'scores' as a Map<string, ...>.
        // But wait, the Evaluation model in frontend (Evaluations.jsx) handles scores per member.
        // Let's re-check the Evaluation data structure.
        // The backend 'Evaluation' is per Group-Task, containing a 'scores' map.
        
        let memberTotalScore = 0;
        if (memberEval && memberEval.scores && memberEval.scores[member._id]) {
            memberTotalScore = memberEval.scores[member._id].totalScore || 0;
        }

        if (filters.minScore && memberTotalScore < parseFloat(filters.minScore)) return false;
        if (filters.maxScore && memberTotalScore > parseFloat(filters.maxScore)) return false;
      }

      return true;
    });
  }, [members, evaluations, filters]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Roll,Group,Email,Contact\n"
      + filteredStudents.map(m => `${m.name},${m.roll},${m.group?.name || '-'},${m.email || '-'},${m.contact || '-'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
          শিক্ষার্থী ফিল্টার
        </h1>
        <button onClick={handleExport} className="btn btn-primary">
          <i className="fa fa-download mr-2"></i>
          এক্সপোর্ট CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card card-body">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">গ্রুপ</label>
            <select 
              className="form-input"
              value={filters.groupId}
              onChange={(e) => setFilters(prev => ({ ...prev, groupId: e.target.value }))}
            >
              <option value="">সব গ্রুপ</option>
              {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">নাম বা রোল</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="খুঁজুন..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">টাস্ক (স্কোর ফিল্টারের জন্য)</label>
            <select 
              className="form-input"
              value={filters.taskId}
              onChange={(e) => setFilters(prev => ({ ...prev, taskId: e.target.value }))}
            >
              <option value="">টাস্ক নির্বাচন করুন</option>
              {tasks.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {filters.taskId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t dark:border-gray-700">
            <div>
              <label className="label">সর্বনিম্ন স্কোর</label>
              <input 
                type="number" 
                className="form-input"
                value={filters.minScore}
                onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">সর্বোচ্চ স্কোর</label>
              <input 
                type="number" 
                className="form-input"
                value={filters.maxScore}
                onChange={(e) => setFilters(prev => ({ ...prev, maxScore: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">নাম</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">রোল</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">গ্রুপ</th>
                {filters.taskId && (
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    স্কোর ({tasks.find(t => t._id === filters.taskId)?.name})
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(member => {
                  let scoreDisplay = '-';
                  if (filters.taskId) {
                    const memberEval = evaluations.find(e => 
                      (e.task?._id === filters.taskId || e.task === filters.taskId) &&
                      (e.group?._id === member.group?._id || e.group === member.group)
                    );
                    if (memberEval && memberEval.scores && memberEval.scores[member._id]) {
                      scoreDisplay = memberEval.scores[member._id].totalScore;
                    }
                  }

                  return (
                    <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 font-medium">{member.name}</td>
                      <td className="px-6 py-4">{member.roll}</td>
                      <td className="px-6 py-4">{member.group?.name || '-'}</td>
                      {filters.taskId && (
                        <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">
                          {scoreDisplay}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={filters.taskId ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                    কোনো শিক্ষার্থী পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
