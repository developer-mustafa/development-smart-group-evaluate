import { useState, useMemo } from 'react';
import { useGetEvaluationsQuery, useGetTasksQuery, useGetMembersQuery, useGetGroupsQuery } from '../../services/api';

// Helper: Role Badge Styles
const getRoleBadgeClass = (role) => {
  const map = {
    'team-leader': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    'time-keeper': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700',
    'reporter': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    'resource-manager': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    'peace-maker': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
  };
  return map[role] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
};

const getRoleLabel = (role) => {
   const map = {
    'team-leader': 'টিম লিডার',
    'time-keeper': 'টাইম কিপার',
    'reporter': 'রিপোর্টার',
    'resource-manager': 'রিসোর্স ম্যানেজার',
    'peace-maker': 'পিস মেকার',
  };
  return map[role] || role;
}

// Helper: Academic Badge Styles (Deterministic)
const getAcadBadgeClass = (name) => {
  if (!name) return 'hidden';
  const colors = [
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// Helper: Score % Badge
const getPctBadgeClass = (pct) => {
  if (pct >= 85) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (pct >= 70) return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
  if (pct >= 55) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
};

export default function GroupDetailModal({ group, onClose }) {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);

  const { data: evaluationsData } = useGetEvaluationsQuery();
  const { data: membersData } = useGetMembersQuery();
  const { data: groupsData } = useGetGroupsQuery();

  const evaluations = useMemo(() => evaluationsData?.data || [], [evaluationsData]);
  const allMembers = useMemo(() => membersData?.data || [], [membersData]);
  const allGroups = useMemo(() => groupsData?.data || [], [groupsData]);

  // Group specific data
  const groupEvaluations = useMemo(() => 
    evaluations.filter(e => e.group?._id === group._id || e.group === group._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), 
  [evaluations, group._id]);

  const groupMembers = useMemo(() => 
    allMembers.filter(m => m.group?._id === group._id || m.group === group._id),
  [allMembers, group._id]);

  // Overall Stats
  const groupAvg = useMemo(() => {
    if (!groupEvaluations.length) return 0;
    const sum = groupEvaluations.reduce((acc, curr) => acc + (curr.groupAverageScore || 0), 0);
    return (sum / groupEvaluations.length).toFixed(1);
  }, [groupEvaluations]);

  // Rank Calculation
  const rank = useMemo(() => {
    if (!allGroups.length || !evaluations.length) return '-';
    
    const groupScores = allGroups.map(g => {
      const gEvals = evaluations.filter(e => e.group?._id === g._id || e.group === g._id);
      if (!gEvals.length) return { id: g._id, avg: 0 };
      const avg = gEvals.reduce((sum, e) => sum + (e.groupAverageScore || 0), 0) / gEvals.length;
      return { id: g._id, avg };
    }).sort((a, b) => b.avg - a.avg);

    const r = groupScores.findIndex(g => g.id === group._id) + 1;
    return r > 0 ? r : '-';
  }, [allGroups, evaluations, group._id]);

  // Selected Assignment Logic
  const selectedEvaluation = groupEvaluations[selectedAssignmentIndex];
  
  const memberRows = useMemo(() => {
    if (!selectedEvaluation) return [];
    
    return groupMembers.map(member => {
      const scoreData = selectedEvaluation.scores?.[member._id] || {};
      const taskScore = parseFloat(scoreData.taskScore) || 0;
      const teamScore = parseFloat(scoreData.teamScore) || 0;
      const additional = parseFloat(scoreData.additionalScore) || 0;
      const mcq = parseFloat(scoreData.mcqScore) || 0;
      const total = parseFloat(scoreData.totalScore) || (taskScore + teamScore + additional + mcq);
      
      const max = selectedEvaluation.task?.maxScore || 100;
      const pct = max > 0 ? (total / max) * 100 : 0;
      
      return {
        ...member,
        taskScore, teamScore, additional, mcq, total, pct,
        comment: scoreData.comments || ''
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [groupMembers, selectedEvaluation]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
              <i className="fa fa-users"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{group.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                  গড়: {groupAvg}%
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium">
                  র‍্যাংক: {rank}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  সদস্য: {groupMembers.length}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i className="fa fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            সদস্যদের ফলাফল
          </button>
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'evaluations'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            মূল্যায়ন ইতিহাস
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-800">
          
          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Assignment Selector */}
              <div className="flex items-center gap-3 bg-white dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600 shadow-sm">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  অ্যাসাইনমেন্ট নির্বাচন:
                </label>
                <select
                  value={selectedAssignmentIndex}
                  onChange={(e) => setSelectedAssignmentIndex(Number(e.target.value))}
                  className="form-select flex-1 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {groupEvaluations.map((ev, idx) => (
                    <option key={ev._id} value={idx}>
                      {ev.task?.name} ({new Date(ev.createdAt).toLocaleDateString('bn-BD')})
                    </option>
                  ))}
                  {groupEvaluations.length === 0 && <option>কোনো মূল্যায়ন নেই</option>}
                </select>
              </div>

              {/* Detailed Table */}
              {selectedEvaluation ? (
                <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b dark:border-gray-600">
                        <tr>
                          <th className="px-4 py-3">রোল</th>
                          <th className="px-4 py-3">ভূমিকা</th>
                          <th className="px-4 py-3">নাম</th>
                          <th className="px-4 py-3 text-right">টাস্ক</th>
                          <th className="px-4 py-3 text-right">টিম</th>
                          <th className="px-4 py-3 text-right">অতিরিক্ত</th>
                          <th className="px-4 py-3 text-right">MCQ</th>
                          <th className="px-4 py-3 text-right">মোট</th>
                          <th className="px-4 py-3 text-center">%</th>
                          <th className="px-4 py-3">মন্তব্য</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                        {memberRows.map((row) => (
                          <tr key={row._id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{row.roll}</td>
                            <td className="px-4 py-3">
                              {row.role && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeClass(row.role)}`}>
                                  {getRoleLabel(row.role)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
                                {row.academicGroup && (
                                  <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getAcadBadgeClass(row.academicGroup)}`}>
                                    {row.academicGroup}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{row.taskScore}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{row.teamScore}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{row.additional}</td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{row.mcq}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{row.total}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPctBadgeClass(row.pct)}`}>
                                {row.pct.toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={row.comment}>
                              {row.comment}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  কোনো ডেটা পাওয়া যায়নি
                </div>
              )}
            </div>
          )}

          {/* EVALUATIONS TAB */}
          {activeTab === 'evaluations' && (
            <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3">অ্যাসাইনমেন্ট</th>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3 text-center">সদস্য</th>
                    <th className="px-4 py-3 text-center">গড় স্কোর</th>
                    <th className="px-4 py-3">সেরা পারফর্মার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                  {groupEvaluations.map((ev) => {
                    // Find top student for this evaluation
                    let topStudentName = '-';
                    let maxScore = -1;
                    if (ev.scores) {
                      Object.entries(ev.scores).forEach(([memberId, score]) => {
                        if (score.totalScore > maxScore) {
                          maxScore = score.totalScore;
                          const m = groupMembers.find(m => m._id === memberId);
                          if (m) topStudentName = m.name;
                        }
                      });
                    }

                    return (
                      <tr key={ev._id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {ev.task?.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {new Date(ev.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                          {Object.keys(ev.scores || {}).length}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPctBadgeClass(ev.groupAverageScore)}`}>
                            {ev.groupAverageScore}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {topStudentName}
                        </td>
                      </tr>
                    );
                  })}
                  {groupEvaluations.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        কোনো মূল্যায়ন ইতিহাস নেই
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
