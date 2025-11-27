import { useState, useEffect } from 'react';
import { 
  useGetEvaluationsQuery, 
  useCreateEvaluationMutation, 
  useUpdateEvaluationMutation,
  useGetTasksQuery, 
  useGetGroupsQuery,
  useGetMembersQuery 
} from '../services/api';
import { useSelector } from 'react-redux';

const ADDITIONAL_CRITERIA = {
  topic: [
    { id: 'topic_none', text: 'এখনো এই টাস্ক পারিনা', marks: -5 },
    { id: 'topic_understood', text: 'শুধু বুঝেছি', marks: 5 },
    { id: 'topic_learned_well', text: 'ভালো করে শিখেছি', marks: 10 },
  ],
  options: [
    { id: 'homework_done', text: 'সপ্তাহে প্রতিদিন বাড়ির কাজ করেছি', marks: 5 },
    { id: 'attendance_regular', text: 'সাপ্তাহিক নিয়মিত উপস্থিতি', marks: 10 },
  ],
};

export default function Evaluations() {
  const { user } = useSelector((state) => state.auth);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [scores, setScores] = useState({});
  const [existingEvaluationId, setExistingEvaluationId] = useState(null);

  const { data: tasksData } = useGetTasksQuery();
  const { data: groupsData } = useGetGroupsQuery();
  const { data: membersData } = useGetMembersQuery({});
  const { data: evaluationsData } = useGetEvaluationsQuery();
  
  const [createEvaluation] = useCreateEvaluationMutation();
  const [updateEvaluation] = useUpdateEvaluationMutation();

  const tasks = tasksData?.data || [];
  const groups = groupsData?.data || [];
  const allMembers = membersData?.data || [];
  const evaluations = evaluationsData?.data || [];

  const selectedTask = tasks.find(t => t._id === selectedTaskId);
  const selectedGroup = groups.find(g => g._id === selectedGroupId);
  const groupMembers = allMembers.filter(m => m.group?._id === selectedGroupId || m.group === selectedGroupId);

  // Initialize or Load Scores
  useEffect(() => {
    if (selectedTaskId && selectedGroupId) {
      const existing = evaluations.find(e => e.task?._id === selectedTaskId && e.group?._id === selectedGroupId);
      
      if (existing) {
        setExistingEvaluationId(existing._id);
        // Transform existing scores map to state
        // Note: Backend returns a Map or Object. Ensure we handle it.
        setScores(existing.scores || {});
      } else {
        setExistingEvaluationId(null);
        // Initialize empty scores for all members
        const initialScores = {};
        groupMembers.forEach(member => {
          initialScores[member._id] = {
            taskScore: '',
            teamScore: '',
            mcqScore: '',
            additionalScore: 0,
            totalScore: 0,
            additionalCriteria: { topic: '', homework: false, attendance: false },
            comments: ''
          };
        });
        setScores(initialScores);
      }
    }
  }, [selectedTaskId, selectedGroupId, evaluations]);

  const handleScoreChange = (memberId, field, value) => {
    setScores(prev => {
      const memberScores = { ...prev[memberId] } || {
        taskScore: '', teamScore: '', mcqScore: '', additionalScore: 0, totalScore: 0,
        additionalCriteria: { topic: '', homework: false, attendance: false }, comments: ''
      };

      if (field.startsWith('criteria.')) {
        const criteriaField = field.split('.')[1];
        memberScores.additionalCriteria = {
          ...memberScores.additionalCriteria,
          [criteriaField]: value
        };
      } else {
        memberScores[field] = value;
      }

      // Recalculate Total
      const taskScore = parseFloat(memberScores.taskScore) || 0;
      const teamScore = parseFloat(memberScores.teamScore) || 0;
      const mcqScore = parseFloat(memberScores.mcqScore) || 0;
      
      let additional = 0;
      const topic = ADDITIONAL_CRITERIA.topic.find(t => t.id === memberScores.additionalCriteria.topic);
      if (topic) additional += topic.marks;
      if (memberScores.additionalCriteria.homework) additional += 5;
      if (memberScores.additionalCriteria.attendance) additional += 10;
      
      // Cap additional score
      const maxAdditional = selectedTask?.maxScoreBreakdown?.additional || 25;
      additional = Math.min(Math.max(additional, -5), maxAdditional);
      memberScores.additionalScore = additional;

      const total = taskScore + teamScore + mcqScore + additional;
      const maxTotal = selectedTask?.maxScore || 100;
      memberScores.totalScore = Math.min(Math.max(total, 0), maxTotal);

      return { ...prev, [memberId]: memberScores };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedGroup) return;

    // Calculate group stats
    const scoredMembers = Object.values(scores).filter(s => 
      s.taskScore !== '' || s.teamScore !== '' || s.mcqScore !== '' || s.additionalCriteria.topic
    );
    
    if (scoredMembers.length === 0) {
      alert('Please score at least one student.');
      return;
    }

    const groupTotalScore = scoredMembers.reduce((sum, s) => sum + s.totalScore, 0);
    const groupAverageScore = (groupTotalScore / scoredMembers.length / (selectedTask.maxScore || 100)) * 100;

    const payload = {
      task: selectedTaskId,
      group: selectedGroupId,
      scores,
      studentCount: scoredMembers.length,
      groupTotalScore,
      groupAverageScore,
      maxPossibleScore: selectedTask.maxScore || 100,
    };

    try {
      if (existingEvaluationId) {
        await updateEvaluation({ id: existingEvaluationId, ...payload }).unwrap();
        alert('Evaluation updated successfully!');
      } else {
        await createEvaluation(payload).unwrap();
        alert('Evaluation submitted successfully!');
      }
      // Reset or redirect? Maybe keep it to show success.
    } catch (error) {
      alert(error.data?.message || 'Operation failed');
    }
  };

  const breakdown = selectedTask?.maxScoreBreakdown || { task: 20, team: 15, additional: 25, mcq: 40 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
          মূল্যায়ন
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">
          শিক্ষার্থী এবং গ্রুপের পারফরম্যান্স মূল্যায়ন করুন
        </p>
      </div>

      <div className="card card-body bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="label text-zinc-700 dark:text-zinc-300">টাস্ক নির্বাচন করুন</label>
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className="form-input bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
              <option value="">নির্বাচন করুন...</option>
              {tasks.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-zinc-700 dark:text-zinc-300">গ্রুপ নির্বাচন করুন</label>
            <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="form-input bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
              <option value="">নির্বাচন করুন...</option>
              {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>
        </div>

        {selectedTaskId && selectedGroupId && (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300">
                  <tr>
                    <th className="p-3">রোল</th>
                    <th className="p-3">নাম</th>
                    <th className="p-3 text-center">টাস্ক ({breakdown.task})</th>
                    <th className="p-3 text-center">টিম ({breakdown.team})</th>
                    <th className="p-3 text-center">MCQ ({breakdown.mcq})</th>
                    <th className="p-3 text-center w-1/3">অতিরিক্ত ({breakdown.additional})</th>
                    <th className="p-3 text-center">মোট ({selectedTask.maxScore})</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {groupMembers.map(member => {
                    const memberScore = scores[member._id] || { 
                      taskScore: '', teamScore: '', mcqScore: '', additionalCriteria: { topic: '', homework: false, attendance: false }, totalScore: 0 
                    };
                    
                    return (
                      <tr key={member._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-3 font-medium text-zinc-900 dark:text-zinc-50">{member.roll}</td>
                        <td className="p-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">{member.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{member.role}</div>
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            className="form-input w-20 text-center mx-auto bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 focus:ring-blue-500 dark:focus:ring-blue-400"
                            value={memberScore.taskScore}
                            onChange={(e) => handleScoreChange(member._id, 'taskScore', e.target.value)}
                            max={breakdown.task}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            className="form-input w-20 text-center mx-auto bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 focus:ring-blue-500 dark:focus:ring-blue-400"
                            value={memberScore.teamScore}
                            onChange={(e) => handleScoreChange(member._id, 'teamScore', e.target.value)}
                            max={breakdown.team}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            className="form-input w-20 text-center mx-auto bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 focus:ring-blue-500 dark:focus:ring-blue-400"
                            value={memberScore.mcqScore}
                            onChange={(e) => handleScoreChange(member._id, 'mcqScore', e.target.value)}
                            max={breakdown.mcq}
                          />
                        </td>
                        <td className="p-3 bg-zinc-50 dark:bg-zinc-900/30">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {ADDITIONAL_CRITERIA.topic.map(opt => (
                                <label key={opt.id} className="flex items-center space-x-1 text-xs cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400">
                                  <input 
                                    type="radio" 
                                    name={`topic-${member._id}`}
                                    checked={memberScore.additionalCriteria?.topic === opt.id}
                                    onChange={() => handleScoreChange(member._id, 'criteria.topic', opt.id)}
                                    className="text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                                  />
                                  <span>{opt.text} ({opt.marks})</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex gap-3 border-t pt-1 border-zinc-200 dark:border-zinc-700">
                              <label className="flex items-center space-x-1 text-xs cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400">
                                <input 
                                  type="checkbox" 
                                  checked={memberScore.additionalCriteria?.homework}
                                  onChange={(e) => handleScoreChange(member._id, 'criteria.homework', e.target.checked)}
                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                                />
                                <span>বাড়ির কাজ (+5)</span>
                              </label>
                              <label className="flex items-center space-x-1 text-xs cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400">
                                <input 
                                  type="checkbox" 
                                  checked={memberScore.additionalCriteria?.attendance}
                                  onChange={(e) => handleScoreChange(member._id, 'criteria.attendance', e.target.checked)}
                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                                />
                                <span>উপস্থিতি (+10)</span>
                              </label>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-lg text-zinc-900 dark:text-zinc-50">
                          {memberScore.totalScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button type="submit" className="btn btn-primary px-8">
                {existingEvaluationId ? 'আপডেট করুন' : 'জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
