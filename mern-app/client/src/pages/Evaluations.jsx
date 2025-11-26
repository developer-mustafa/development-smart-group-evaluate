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
      <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
        মূল্যায়ন
      </h1>

      <div className="card card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="label">টাস্ক নির্বাচন করুন</label>
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className="form-input">
              <option value="">নির্বাচন করুন...</option>
              {tasks.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">গ্রুপ নির্বাচন করুন</label>
            <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="form-input">
              <option value="">নির্বাচন করুন...</option>
              {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>
        </div>

        {selectedTaskId && selectedGroupId && (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
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
                <tbody>
                  {groupMembers.map(member => {
                    const memberScore = scores[member._id] || { 
                      taskScore: '', teamScore: '', mcqScore: '', additionalCriteria: { topic: '', homework: false, attendance: false }, totalScore: 0 
                    };
                    
                    return (
                      <tr key={member._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 font-medium">{member.roll}</td>
                        <td className="p-3">
                          <div>{member.name}</div>
                          <div className="text-xs text-gray-500">{member.role}</div>
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            className="form-input w-20 text-center mx-auto"
                            value={memberScore.taskScore}
                            onChange={(e) => handleScoreChange(member._id, 'taskScore', e.target.value)}
                            max={breakdown.task}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            className="form-input w-20 text-center mx-auto"
                            value={memberScore.teamScore}
                            onChange={(e) => handleScoreChange(member._id, 'teamScore', e.target.value)}
                            max={breakdown.team}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            className="form-input w-20 text-center mx-auto"
                            value={memberScore.mcqScore}
                            onChange={(e) => handleScoreChange(member._id, 'mcqScore', e.target.value)}
                            max={breakdown.mcq}
                          />
                        </td>
                        <td className="p-3 bg-gray-50 dark:bg-gray-900/30">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {ADDITIONAL_CRITERIA.topic.map(opt => (
                                <label key={opt.id} className="flex items-center space-x-1 text-xs cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`topic-${member._id}`}
                                    checked={memberScore.additionalCriteria?.topic === opt.id}
                                    onChange={() => handleScoreChange(member._id, 'criteria.topic', opt.id)}
                                    className="text-blue-600"
                                  />
                                  <span>{opt.text} ({opt.marks})</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex gap-3 border-t pt-1 dark:border-gray-600">
                              <label className="flex items-center space-x-1 text-xs cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={memberScore.additionalCriteria?.homework}
                                  onChange={(e) => handleScoreChange(member._id, 'criteria.homework', e.target.checked)}
                                  className="rounded text-blue-600"
                                />
                                <span>বাড়ির কাজ (+5)</span>
                              </label>
                              <label className="flex items-center space-x-1 text-xs cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={memberScore.additionalCriteria?.attendance}
                                  onChange={(e) => handleScoreChange(member._id, 'criteria.attendance', e.target.checked)}
                                  className="rounded text-blue-600"
                                />
                                <span>উপস্থিতি (+10)</span>
                              </label>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-lg">
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
