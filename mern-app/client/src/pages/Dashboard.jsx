import { useMemo } from 'react';
import { useGetGroupsQuery, useGetMembersQuery, useGetTasksQuery, useGetEvaluationsQuery } from '../services/api';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// --- Helper Functions ---
const toBanglaNumber = (num) => {
  if (num === undefined || num === null) return '-';
  const map = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return num.toString().replace(/[0-9]/g, (d) => map[d]);
};

const calculateStats = (groups, members, tasks, evaluations) => {
  const totalGroups = groups.length;
  const totalStudents = members.length;
  const totalTasks = tasks.length;

  const maleStudents = members.filter(m => m.gender === 'ছেলে').length;
  const femaleStudents = members.filter(m => m.gender === 'মেয়ে').length;
  const malePercentage = totalStudents > 0 ? ((maleStudents / totalStudents) * 100).toFixed(1) : 0;
  const femalePercentage = totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : 0;

  const academicGroups = new Set(members.map(m => m.academicGroup).filter(Boolean));
  const totalAcademicGroups = academicGroups.size;

  const pendingRoles = members.filter(m => !m.role).length;

  // Group Performance
  const groupPerformance = groups.map(group => {
    const groupEvals = evaluations.filter(e => e.group?._id === group._id || e.group === group._id);
    const avgScore = groupEvals.length > 0
      ? groupEvals.reduce((sum, e) => sum + (e.groupAverageScore || 0), 0) / groupEvals.length
      : 0;
    const groupMembers = members.filter(m => m.group?._id === group._id || m.group === group._id);
    return { ...group, avgScore, memberCount: groupMembers.length, evalCount: groupEvals.length };
  }).sort((a, b) => b.avgScore - a.avgScore);

  // Latest Assignment
  const latestTask = tasks.length > 0 ? tasks.reduce((prev, current) => {
    return new Date(prev.createdAt) > new Date(current.createdAt) ? prev : current;
  }) : null;

  let latestAssignmentStats = {
    average: 0,
    evaluated: 0,
    pending: 0,
    total: totalStudents,
    groupEvaluated: 0,
    groupPending: 0,
    groupTotal: totalGroups,
    updatedAt: '-'
  };

  if (latestTask) {
    const latestEvals = evaluations.filter(e => e.task?._id === latestTask._id || e.task === latestTask._id);
    const evaluatedStudentIds = new Set();
    latestEvals.forEach(e => {
      if (e.scores) {
        Object.keys(e.scores).forEach(id => evaluatedStudentIds.add(id));
      }
    });
    const evaluatedCount = evaluatedStudentIds.size;
    let studentTotalScore = 0;
    let studentScoreCount = 0;
    latestEvals.forEach(e => {
      if (e.scores) {
        Object.values(e.scores).forEach(s => {
          studentTotalScore += s.totalScore || 0;
          studentScoreCount++;
        });
      }
    });
    latestAssignmentStats = {
      average: studentScoreCount > 0 ? (studentTotalScore / studentScoreCount).toFixed(1) : 0,
      evaluated: evaluatedCount,
      pending: totalStudents - evaluatedCount,
      total: totalStudents,
      groupEvaluated: latestEvals.length,
      groupPending: totalGroups - latestEvals.length,
      groupTotal: totalGroups,
      updatedAt: new Date(latestTask.createdAt).toLocaleDateString('bn-BD')
    };
  }

  const pendingEvaluations = Math.max(0, totalTasks * totalGroups - evaluations.length);

  return {
    totalGroups,
    totalStudents,
    totalTasks,
    maleStudents,
    femaleStudents,
    malePercentage,
    femalePercentage,
    totalAcademicGroups,
    pendingRoles,
    groupPerformance,
    latestAssignmentStats,
    latestTask,
    pendingEvaluations
  };
};

export default function Dashboard() {
  const { data: groupsData } = useGetGroupsQuery();
  const { data: membersData } = useGetMembersQuery();
  const { data: tasksData } = useGetTasksQuery();
  const { data: evaluationsData } = useGetEvaluationsQuery();
  const { dashboardSections } = useSelector(state => state.settings);

  const stats = useMemo(() => {
    if (!groupsData || !membersData || !tasksData || !evaluationsData) return null;
    return calculateStats(
      groupsData.data || [],
      membersData.data || [],
      tasksData.data || [],
      evaluationsData.data || []
    );
  }, [groupsData, membersData, tasksData, evaluationsData]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500 animate-pulse">ড্যাশবোর্ড ডেটা লোড হচ্ছে...</div>
      </div>
    );
  }

  const {
    totalGroups,
    totalStudents,
    totalTasks,
    maleStudents,
    femaleStudents,
    malePercentage,
    femalePercentage,
    totalAcademicGroups,
    pendingRoles,
    groupPerformance,
    latestAssignmentStats,
    latestTask,
    pendingEvaluations
  } = stats;

  const top3Groups = groupPerformance.slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Hero Section */}
      {dashboardSections.hero && (
        <section className="relative overflow-hidden rounded-3xl border border-slate-300/60 bg-gradient-to-br from-white via-slate-50 to-slate-200 text-slate-900 shadow-lg dark:border-slate-700/60 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-black dark:text-slate-100">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.35),transparent_60%)]"></div>
          <div className="relative p-4 space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-slate-300/70 bg-white/70 backdrop-blur shadow-sm p-4 dark:border-slate-700/70 dark:bg-slate-900/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">স্মার্ট ইভ্যালুয়েট সিস্টেম</h1>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-semibold">
                  <span className="px-4 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700">টাস্ক স্কোর</span>
                  <span className="px-4 py-1.5 rounded-2xl bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100 border border-sky-200 dark:border-sky-700">টিম স্কোর</span>
                  <span className="px-4 py-1.5 rounded-2xl bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100 border border-rose-200 dark:border-rose-700">অতিরিক্ত স্কোর</span>
                  <span className="px-4 py-1.5 rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100 border border-amber-200 dark:border-amber-700">MCQ স্কোর</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 items-stretch">
              {/* Progress Card */}
              <article className="rounded-3xl border border-slate-300/70 bg-white/50 backdrop-blur p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white/80">
                    <i className="fas fa-chart-simple text-indigo-600 dark:text-indigo-400"></i>
                    মূল্যায়ন প্রদানের অগ্রগতি
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">শিক্ষার্থী</span>
                        <i className="fas fa-user-graduate text-emerald-600 dark:text-emerald-400"></i>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>মূল্যায়িত</span><span className="font-bold">{toBanglaNumber(latestAssignmentStats.evaluated)} জন</span></div>
                        <div className="flex justify-between"><span>অবশিষ্ট</span><span className="font-bold">{toBanglaNumber(latestAssignmentStats.pending)} জন</span></div>
                        <div className="flex justify-between"><span>মোট</span><span className="font-bold">{toBanglaNumber(latestAssignmentStats.total)} জন</span></div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-3 dark:border-sky-800 dark:bg-sky-900/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-sky-900 dark:text-sky-200">গ্রুপ</span>
                        <i className="fas fa-layer-group text-sky-600 dark:text-sky-400"></i>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>মূল্যায়িত</span><span className="font-bold">{toBanglaNumber(latestAssignmentStats.groupEvaluated)} টি</span></div>
                        <div className="flex justify-between"><span>অবশিষ্ট</span><span className="font-bold">{toBanglaNumber(latestAssignmentStats.groupPending)} টি</span></div>
                        <div className="flex justify-between"><span>মোট</span><span className="font-bold">{toBanglaNumber(latestAssignmentStats.groupTotal)} টি</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              {/* Latest Assignment Card */}
              <article className="rounded-3xl border border-slate-300/70 bg-gradient-to-br from-blue-50 to-sky-100 p-5 shadow-sm dark:border-slate-700/70 dark:from-slate-800 dark:to-slate-900">
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">সর্বশেষ এসাইনমেন্ট • {toBanglaNumber(latestAssignmentStats.updatedAt)}</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">{latestTask?.name || 'কোনো এসাইনমেন্ট নেই'}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-20 w-20 rounded-full border-4 border-emerald-400 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm">
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{toBanglaNumber(latestAssignmentStats.average)}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">গড় স্কোর</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-20 w-20 rounded-full border-4 border-sky-400 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm">
                      <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                        {toBanglaNumber(latestAssignmentStats.total > 0 ? ((latestAssignmentStats.evaluated / latestAssignmentStats.total) * 100).toFixed(0) : 0)}%
                      </span>
                    </div>
                    <span className="text-xs font-bold text-sky-800 dark:text-sky-200">সামগ্রিক উন্নতি</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      )}

      {/* Stats Grid */}
      {dashboardSections.stats && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ title: 'মোট গ্রুপ', value: totalGroups, icon: 'fa-layer-group', color: 'indigo', sub: 'সক্রিয় সব গ্রুপ' },
            { title: 'মোট শিক্ষার্থী', value: totalStudents, icon: 'fa-user-graduate', color: 'emerald', sub: 'নিবন্ধিত সদস্য' },
            { title: 'একাডেমিক গ্রুপ', value: totalAcademicGroups, icon: 'fa-university', color: 'sky', sub: 'শাখাভিত্তিক' },
            { title: 'দায়িত্ব বাকি', value: pendingRoles, icon: 'fa-user-clock', color: 'amber', sub: 'ভূমিকাহীন সদস্য' },
            { title: 'ছেলে সদস্য', value: maleStudents, icon: 'fa-male', color: 'blue', sub: `${toBanglaNumber(malePercentage)}%` },
            { title: 'মেয়ে সদস্য', value: femaleStudents, icon: 'fa-female', color: 'rose', sub: `${toBanglaNumber(femalePercentage)}%` },
            { title: 'মোট টাস্ক', value: totalTasks, icon: 'fa-tasks', color: 'teal', sub: 'নির্ধারিত টাস্ক' },
            { title: 'বাকি মূল্যায়ন', value: pendingEvaluations, icon: 'fa-hourglass-half', color: 'red', sub: 'অসম্পন্ন' }].map((stat, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 via-transparent to-transparent`}></div>
              <div className="relative flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{toBanglaNumber(stat.value)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <i className={`fas ${stat.icon} text-lg`}></i>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
{/* Academic Stats */}
{dashboardSections.academicStats && (
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">একাডেমিক গ্রুপ</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{toBanglaNumber(totalAcademicGroups)}</p>
        </div>
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400">
          <i className="fas fa-university text-lg"></i>
        </div>
      </div>
    </div>
  </section>
)}

      {/* Elite Groups */}
      {dashboardSections.topGroups && top3Groups.length > 0 && (
        <section className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">এলিট গ্রুপ</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">শীর্ষ পারফর্মারদের তালিকা</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                <i className="fas fa-crown mr-1"></i> Top 3
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* 2nd Place */}
              {top3Groups[1] && (
                <div className="order-2 md:order-1 relative p-4 rounded-2xl bg-gray-100 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold shadow-sm">2</div>
                  <h4 className="mt-4 font-bold text-gray-800 dark:text-white truncate">{top3Groups[1].name}</h4>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 my-2">{toBanglaNumber(top3Groups[1].avgScore.toFixed(1))}%</p>
                  <p className="text-xs text-gray-5">গড় স্কোর</p>
                </div>
              )}
              {/* 1st Place */}
              {top3Groups[0] && (
                <div className="order-1 md:order-2 relative p-6 rounded-2xl bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 border-2 border-yellow-400 text-center shadow-lg transform md:-translate-y-4">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-xl font-bold shadow-md">
                    <i className="fas fa-crown"></i>
                  </div>
                  <h4 className="mt-6 text-xl font-bold text-gray-900 dark:text-white truncate">{top3Groups[0].name}</h4>
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 my-2">{toBanglaNumber(top3Groups[0].avgScore.toFixed(1))}%</p>
                  <p className="text-sm text-gray-500">গড় স্কোর</p>
                </div>
              )}
              {/* 3rd Place */}
              {top3Groups[2] && (
                <div className="order-3 md:order-3 relative p-4 rounded-2xl bg-orange-50 dark:bg-gray-700/50 border-2 border-orange-200 dark:border-orange-900/50 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-300 text-orange-800 flex items-center justify-center font-bold shadow-sm">3</div>
                  <h4 className="mt-4 font-bold text-gray-800 dark:text-white truncate">{top3Groups[2].name}</h4>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 my-2">{toBanglaNumber(top3Groups[2].avgScore.toFixed(1))}%</p>
                  <p className="text-xs text-gray-500">গড় স্কোর</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Group Ranking List */}
      {dashboardSections.ranking && (
        <section className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">গ্রুপ র‍্যাঙ্কিং</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">র‍্যাংক</th>
                  <th className="px-6 py-3">গ্রুপ নাম</th>
                  <th className="px-6 py-3 text-center">সদস্য</th>
                  <th className="px-6 py-3 text-center">মূল্যায়ন</th>
                  <th className="px-6 py-3 text-right">গড় স্কোর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {groupPerformance.map((group, idx) => (
                  <tr key={group._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400">#{toBanglaNumber(idx + 1)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{group.name}</td>
                    <td className="px-6 py-4 text-center">{toBanglaNumber(group.memberCount)}</td>
                    <td className="px-6 py-4 text-center">{toBanglaNumber(group.evalCount)}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{toBanglaNumber(group.avgScore.toFixed(1))}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
