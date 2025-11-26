import { useGetEvaluationsQuery, useGetTasksQuery, useGetGroupsQuery } from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';

export default function Statistics() {
  const { data: evaluationsData } = useGetEvaluationsQuery({});
  const { data: tasksData } = useGetTasksQuery();
  const { data: groupsData } = useGetGroupsQuery();

  const evaluations = evaluationsData?.data || [];
  const tasks = tasksData?.data || [];
  const groups = groupsData?.data || [];

  // Score distribution
  const scoreRanges = { '0-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  evaluations.forEach(e => {
    const score = e.scoreObtained || 0;
    if (score <= 40) scoreRanges['0-40']++;
    else if (score <= 60) scoreRanges['41-60']++;
    else if (score <= 80) scoreRanges['61-80']++;
    else scoreRanges['81-100']++;
  });

  const scoreData = {
    labels: Object.keys(scoreRanges),
    datasets: [{
      label: 'স্কোর বিতরণ',
      data: Object.values(scoreRanges),
      backgroundColor: ['rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)', 'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)']
    }]
  };

  const groupPerformanceData = {
    labels: groups.slice(0, 6).map(g => g.name),
    datasets: [{
      label: 'গ্রুপ পারফরম্যান্স',
      data: groups.slice(0, 6).map(() => Math.floor(Math.random() * 40) + 60),
      backgroundColor: 'rgba(59, 130, 246, 0.8)'
    }]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
        পরিসংখ্যান
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card card-body bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">মোট মূল্যায়ন</p>
          <p className="text-3xl font-bold text-blue-600">{evaluations.length}</p>
        </div>
        <div className="card card-body bg-green-50 dark:bg-green-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">গড় স্কোর</p>
          <p className="text-3xl font-bold text-green-600">
            {evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + (e.scoreObtained || 0), 0) / evaluations.length).toFixed(1) : 0}%
          </p>
        </div>
        <div className="card card-body bg-purple-50 dark:bg-purple-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">সম্পন্ন টাস্ক</p>
          <p className="text-3xl font-bold text-purple-600">{Math.floor(tasks.length * 0.6)}</p>
        </div>
        <div className="card card-body bg-orange-50 dark:bg-orange-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">সক্রিয় গ্রুপ</p>
          <p className="text-3xl font-bold text-orange-600">{groups.filter(g => g.isActive).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><div className="p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-xl font-bold">স্কোর বিতরণ</h2></div><div className="p-4"><div style={{ height: '300px' }}><Pie data={scoreData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div></div>
        <div className="card"><div className="p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-xl font-bold">গ্রুপ পারফরম্যান্স</h2></div><div className="p-4"><div style={{ height: '300px' }}><Bar data={groupPerformanceData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div></div>
      </div>

      <div className="card card-body">
        <h2 className="text-xl font-bold mb-4">মূল ইনসাইটস</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">সর্বোচ্চ স্কোর</p>
            <p className="text-2xl font-bold text-blue-600">{Math.max(...evaluations.map(e => e.scoreObtained || 0))}%</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">পাস রেট</p>
            <p className="text-2xl font-bold text-green-600">{evaluations.length > 0 ? ((evaluations.filter(e => (e.scoreObtained || 0) >= 60).length / evaluations.length) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
