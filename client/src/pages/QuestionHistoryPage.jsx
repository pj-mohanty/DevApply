import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getInterviewHistory,
  analyzeAnswer,
  saveUserAnswer,
  deleteQuestionHistory,
} from '../utils/api';
import AISolutionBox from '../components/AISolutionBox';
import AIAnalysisBox from '../components/AIAnalysisBox';
import CodeEditor from '../components/CodeEditor';

export default function QuestionHistoryPage() {
  const { user } = useAuth();
  const [allQuestions, setAllQuestions] = useState([]);
  const [positionFilter, setPositionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [solutionMap, setSolutionMap] = useState({});
  const [analysisVisibility, setAnalysisVisibility] = useState({});
  const [answerVisibility, setAnswerVisibility] = useState({});
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswers, setEditedAnswers] = useState({});
  const [processingAnswer, setProcessingAnswer] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    async function fetchHistory() {
      setLoading(true);
      try {
        const data = await getInterviewHistory(user.uid);
        const entries = Array.isArray(data) ? data : [];
        const sorted = entries.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setAllQuestions(sorted);
        setFilteredQuestions(sorted);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  useEffect(() => {
    let filtered = allQuestions;

    if (positionFilter) {
      filtered = filtered.filter(q => q.positionDisplay === positionFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter(q => q.type === typeFilter);
    }

    setFilteredQuestions(filtered);
  }, [positionFilter, typeFilter, allQuestions]);

  const handleShowSolution = (id, question) => {
    setSolutionMap(prev => ({
      ...prev,
      [id]: {
        loading: false,
        visible: !prev[id]?.visible,
        content: question.aiSolution || 'No model answer available.'
      }
    }));
  };

  const toggleAnalysisVisibility = (id) => {
    setAnalysisVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAnswerVisibility = (id) => {
    setAnswerVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleEditAnswer = (id, currentAnswer) => {
    setEditingAnswerId(id);
    setEditedAnswers(prev => ({
      ...prev,
      [id]: currentAnswer
    }));
  };

  const handleCancelEdit = (id) => {
    setEditingAnswerId(null);
    setEditedAnswers(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
  };
  const handleDeleteQuestion = async (id) => {
  try {
    await deleteQuestionHistory(id);
    setAllQuestions(prev => prev.filter(q => q.id !== id));
    setFilteredQuestions(prev => prev.filter(q => q.id !== id));
  } catch (err) {
    console.error('Failed to delete question:', err);
    alert(`Failed to delete question: ${err.response?.data?.error || err.message}`);
  }
};
  const handleAnswerChange = (id, value) => {
    setEditedAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmitAnswer = async (id, question) => {
  if (!editedAnswers[id]?.trim()) return;

  setProcessingAnswer(id);
  try {
    
    const analysisData = await analyzeAnswer({
      question: question.question,
      userAnswer: editedAnswers[id],
      type: question.type,
      context: question.context || {}
    });

    const aiAnalysis = typeof analysisData.analysis === 'string' 
      ? analysisData.analysis 
      : JSON.stringify(analysisData.analysis);

    const newEntryResponse = await saveUserAnswer({
      uid: user.uid,
      applicationId: question.applicationId,
      type: question.type,
      question: question.question,
      userAnswer: editedAnswers[id],
      aiAnalysis,
      aiSolution: question.aiSolution || '',
      language: question.language,
      positionDisplay: question.positionDisplay,
      context: question.context || {}
    });

    await deleteQuestionHistory(id);

    setAllQuestions(prev => {
      const filtered = prev.filter(q => q.id !== id);
      return [{
        id: newEntryResponse.id, 
        ...question,
        userAnswer: editedAnswers[id],
        aiAnalysis,
        createdAt: new Date() 
      }, ...filtered];
    });

    setEditingAnswerId(null);
    setEditedAnswers(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
  } catch (err) {
    console.error('Error updating answer:', err);
    alert('Failed to update answer. Please try again.');
  } finally {
    setProcessingAnswer(null);
  }
};

  const positionOptions = [...new Set(allQuestions.map(q => q.positionDisplay).filter(Boolean))];
  const typeOptions = [...new Set(allQuestions.map(q => q.type).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-6">Mock Interview Question</h1>

      <div className="bg-white border rounded-lg p-4 mb-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Position:</label>
          <select
            className="border px-3 py-1 rounded text-sm"
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value)}
          >
            <option value="">All Positions</option>
            {positionOptions.map((pos, i) => (
              <option key={i} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Question Type:</label>
          <select
            className="border px-3 py-1 rounded text-sm"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {typeOptions.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-8">Loading history...</p>
      ) : filteredQuestions.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No interview questions found.</p>
      ) : (
        filteredQuestions.map((q) => (
          <div key={q.id} className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex justify-between items-start mb-1 flex-wrap">
              <div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  q.type === 'Coding' ? 'bg-green-100 text-green-700' :
                  q.type === 'System Design' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {q.type}
                </span>
                <span className="text-xs text-gray-700 ml-2 font-medium">
                  {q.positionDisplay || 'No position specified'}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
                <button
                  onClick={() => toggleAnswerVisibility(q.id)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                >
                  {answerVisibility[q.id] ? 'Hide Previous Attempt' : 'Show Previous Attempt'}
                </button>

                {q.aiAnalysis && (
                  <button
                    onClick={() => toggleAnalysisVisibility(q.id)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    {analysisVisibility[q.id] ? 'Hide AI Analysis' : 'Show AI Analysis'}
                  </button>
                )}

                {q.aiSolution && (
                  <button
                    onClick={() => handleShowSolution(q.id, q)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    {solutionMap[q.id]?.visible ? 'Hide AI Solution' : 'Show AI Solution'}
                  </button>
                )}
                <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
              </div>
            </div>

            <p className="font-semibold text-gray-800 mt-2">{q.question}</p>

            {answerVisibility[q.id] && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-700">Your Answer:</p>
                  {editingAnswerId !== q.id ? (
                    <button
                      onClick={() => handleEditAnswer(q.id, q.userAnswer)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Edit Your Answer
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitAnswer(q.id, q)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        disabled={processingAnswer === q.id}
                      >
                        {processingAnswer === q.id ? 'Processing...' : 'Submit'}
                      </button>
                      <button
                        onClick={() => handleCancelEdit(q.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {editingAnswerId === q.id ? (
                  q.type === 'Coding' ? (
                    <div className="border rounded overflow-auto max-h-96">
                      <CodeEditor 
                        value={editedAnswers[q.id] || q.userAnswer} 
                        onChange={(value) => handleAnswerChange(q.id, value)}
                        language={q.language || 'javascript'} 
                        wrapEnabled={true}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={editedAnswers[q.id] || q.userAnswer}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full border rounded px-2 py-2 text-sm mb-2 min-h-[100px] resize-y"
                    />
                  )
                ) : (
                  q.type === 'Coding' ? (
                    <div className="border rounded overflow-auto max-h-96">
                      <CodeEditor 
                        value={q.userAnswer} 
                        language={q.language || 'javascript'} 
                        readOnly 
                        wrapEnabled={true}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-3 rounded whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                      {q.userAnswer}
                    </div>
                  )
                )}
              </div>
            )}

            {analysisVisibility[q.id] && q.aiAnalysis && (
              <div className="mt-3">
                <AIAnalysisBox content={q.aiAnalysis} />
              </div>
            )}

            {solutionMap[q.id]?.visible && (
              <div className="mt-3">
                <AISolutionBox content={solutionMap[q.id].content} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}