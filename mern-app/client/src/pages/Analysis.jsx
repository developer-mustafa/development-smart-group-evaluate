import { useMemo } from 'react';
import { useGetEvaluationsQuery, useGetGroupsQuery, useGetTasksQuery } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analysis() {
  const { data: evaluationsData } = useGetEvaluationsQuery();
  const { data: groupsData } = useGetGroupsQuery();
  const { data: tasksData } = useGetTasksQuery();

  const evaluations = evaluationsData?.data || [];
  const groups = groupsData?.data || [];
  const tasks = tasksData?.data || [];

  // --- Performance Trend Data (Line Chart) ---
  const trendData = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const labels = sortedTasks.map(t => t.name);

    const datasets = groups.map((group, index) => {
      const data = sortedTasks.map(task => {
        const groupEval = evaluations.find(e => 
          (e.task?._id === task._id || e.task === task._id) && 
          (e.group?._id === group._id || e.group === group._id)
        );
        return groupEval ? groupEval.groupAverageScore : null;
      });

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const color = colors[index % colors.length];

      return {
        label: group.name,
        data,
        borderColor: color,
        backgroundColor: color + '20', // Transparent fill
        fill: true,
        tension: 0.4,
      };
    });

    return { labels, datasets };
  }, [tasks, groups, evaluations]);

  // --- Comparative Analysis Data (Bar Chart) ---
  const comparativeData = useMemo(() => {
    const labels = groups.map(g => g.name);
    
    // Calculate average score across all tasks for each group
    const data = groups.map(group => {
      const groupEvaluations = evaluations.filter(e => 
        e.group?._id === group._id || e.group === group._id
      );
      if (groupEvaluations.length === 0) return 0;
      
      const totalAvg = groupEvaluations.reduce((sum, e) => sum + (e.groupAverageScore || 0), 0);
      return (totalAvg / groupEvaluations.length).toFixed(1);
    });

    return {
      labels,
      datasets: [
        {
          label: 'গড় পারফরম্যান্স (%)',
          data,
          backgroundColor: labels.map((_, i) => [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ][i % 5]),
          borderRadius: 6,
        },
      ],
    };
  }, [groups, evaluations]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
        অ্যানালাইসিস ড্যাশবোর্ড
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="card card-body">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            পারফরম্যান্স ট্রেন্ড (সময়ের সাথে)
          </h2>
          <div className="h-80">
            <Line data={trendData} options={options} />
          </div>
        </div>

        {/* Comparative Analysis */}
        <div className="card card-body">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            গ্রুপ তুলনামূলক বিশ্লেষণ
          </h2>
          <div className="h-80">
            <Bar data={comparativeData} options={options} />
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="card card-body">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          বিস্তারিত ইনসাইটস
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map(group => {
            const groupEvaluations = evaluations.filter(e => e.group?._id === group._id || e.group === group._id);
            const avgScore = groupEvaluations.length 
              ? (groupEvaluations.reduce((sum, e) => sum + (e.groupAverageScore || 0), 0) / groupEvaluations.length).toFixed(1)
              : 0;
            const bestTask = groupEvaluations.sort((a, b) => b.groupAverageScore - a.groupAverageScore)[0];

            return (
              <div key={group._id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/30 dark:border-gray-600">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{group.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p>গড় স্কোর: <span className="font-semibold text-blue-600">{avgScore}%</span></p>
                  <p>মূল্যায়ন সংখ্যা: {groupEvaluations.length}</p>
                  <p>সেরা টাস্ক: {bestTask ? bestTask.task?.name || 'Unknown' : '-'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
