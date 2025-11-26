import { useMemo } from 'react';
import { useGetEvaluationsQuery } from '../../services/api';

// Helper: Bangla Number
const toBanglaNumber = (num) => {
  const map = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return num.toString().replace(/[0-9]/g, (d) => map[d]);
};

// Helper: Role Badge
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
};

// Helper: Score Palette
const getScorePalette = (pct) => {
  if (pct >= 85) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (pct >= 70) return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
  if (pct >= 55) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
};

export default function StudentDetailModal({ student, onClose }) {
  const { data: evaluationsData } = useGetEvaluationsQuery();
  const evaluations = useMemo(() => evaluationsData?.data || [], [evaluationsData]);

  const studentEvaluations = useMemo(() => {
    return evaluations
      .filter(e => e.scores?.[student._id])
      .map(e => {
        const scoreData = e.scores[student._id];
        const taskScore = parseFloat(scoreData.taskScore) || 0;
        const teamScore = parseFloat(scoreData.teamScore) || 0;
        const additional = parseFloat(scoreData.additionalScore) || 0;
        const mcq = parseFloat(scoreData.mcqScore) || 0;
        const total = parseFloat(scoreData.totalScore) || (taskScore + teamScore + additional + mcq);
        const max = parseFloat(e.maxPossibleScore) || parseFloat(e.task?.maxScore) || 100;
        const pct = max > 0 ? (total / max) * 100 : 0;

        return {
          ...e,
          taskScore, teamScore, additional, mcq, total, max, pct,
          comment: scoreData.comments || ''
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [evaluations, student._id]);

  // Summary Stats
  const stats = useMemo(() => {
    if (!studentEvaluations.length) return null;
    const count = studentEvaluations.length;
    const sums = studentEvaluations.reduce((acc, curr) => ({
      task: acc.task + curr.taskScore,
      team: acc.team + curr.teamScore,
      additional: acc.additional + curr.additional,
      mcq: acc.mcq + curr.mcq,
      total: acc.total + curr.total,
      pct: acc.pct + curr.pct
    }), { task: 0, team: 0, additional: 0, mcq: 0, total: 0, pct: 0 });

    return {
      avgTask: sums.task / count,
      avgTeam: sums.team / count,
      avgAdditional: sums.additional / count,
      avgMcq: sums.mcq / count,
      avgTotal: sums.total / count,
      avgPct: sums.pct / count,
      count
    };
  }, [studentEvaluations]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 shadow-sm">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                {student.role && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeClass(student.role)}`}>
                    <i className="fas fa-id-badge mr-1"></i>
                    {getRoleLabel(student.role)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span>রোল: {toBanglaNumber(student.roll)}</span>
                <span>•</span>
                <span>গ্রুপ: {student.group?.name || '-'}</span>
                <span>•</span>
                <span>বিভাগ: {student.academicGroup || '-'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i className="fa fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-800">
          
          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border dark:border-gray-600 shadow-sm">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">গড় টাস্ক স্কোর</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{toBanglaNumber(stats.avgTask.toFixed(1))}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border dark:border-gray-600 shadow-sm">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">গড় টিম স্কোর</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{toBanglaNumber(stats.avgTeam.toFixed(1))}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border dark:border-gray-600 shadow-sm">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">গড় অতিরিক্ত</div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{toBanglaNumber(stats.avgAdditional.toFixed(1))}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border dark:border-gray-600 shadow-sm">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">গড় MCQ স্কোর</div>
                <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{toBanglaNumber(stats.avgMcq.toFixed(1))}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border dark:border-gray-600 shadow-sm">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">গড় মোট স্কোর</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{toBanglaNumber(stats.avgTotal.toFixed(1))}</div>
              </div>
            </div>
          )}

          {/* Detailed Table */}
          <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 overflow-hidden shadow-sm">
            <div className="p-4 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white">মূল্যায়ন ইতিহাস</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                মোট {toBanglaNumber(studentEvaluations.length)} টি মূল্যায়ন
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3">অ্যাসাইনমেন্ট</th>
                    <th className="px-4 py-3 text-right">টাস্ক</th>
                    <th className="px-4 py-3 text-right">টিম</th>
                    <th className="px-4 py-3 text-right">অতিরিক্ত</th>
                    <th className="px-4 py-3 text-right">MCQ</th>
                    <th className="px-4 py-3 text-right">মোট</th>
                    <th className="px-4 py-3 text-center">%</th>
                    <th className="px-4 py-3">মন্তব্য</th>
                    <th className="px-4 py-3 text-right">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                  {studentEvaluations.map((ev) => (
                    <tr key={ev._id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {ev.task?.name || 'Unknown Task'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        {toBanglaNumber(ev.taskScore)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        {toBanglaNumber(ev.teamScore)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        {toBanglaNumber(ev.additional)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        {toBanglaNumber(ev.mcq)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {toBanglaNumber(ev.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getScorePalette(ev.pct)}`}>
                          {toBanglaNumber(ev.pct.toFixed(0))}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={ev.comment}>
                        {ev.comment || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(ev.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                  {studentEvaluations.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        কোনো মূল্যায়ন পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
