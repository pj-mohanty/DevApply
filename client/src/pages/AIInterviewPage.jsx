import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import AISolutionBox from '../components/AISolutionBox';
import AIAnalysisBox from '../components/AIAnalysisBox'; 
import CodeEditor from '../components/CodeEditor';

import {
  generateInterviewQuestion,
  analyzeAnswer,
  generateSolution,
  saveUserAnswer,
  generateSimilarQuestion 
} from '../utils/api';

const INITIAL_QUESTIONS = [
  { 
    type: 'Coding', 
    title: 'This is Coding Question', 
    description: '', 
    userInput: '', 
    language: 'javascript', // default language
    submitted: false, 
    aiAnalysis: '', 
    aiSolution: '', 
    showSolution: false, 
    generateCount: 1, 
    skipped: false, 
    moreQuestionClicked: false 
  },
  { 
    type: 'System Design', 
    title: 'This is System Design Question', 
    description: '', 
    userInput: '', 
    submitted: false, 
    aiAnalysis: '', 
    aiSolution: '', 
    showSolution: false, 
    generateCount: 1, 
    skipped: false, 
    moreQuestionClicked: false 
  },
  { 
    type: 'Experience', 
    title: 'This is Question based on your Working and Project experiences', 
    description: '', 
    userInput: '', 
    submitted: false, 
    aiAnalysis: '', 
    aiSolution: '', 
    showSolution: false, 
    generateCount: 1, 
    skipped: false, 
    moreQuestionClicked: false 
  },
];

export default function AIInterviewPage() {
  const location = useLocation();
  const app = location.state?.app;
  const selectedResume = app?.resume || '';

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [selectedTypes, setSelectedTypes] = useState({ Coding: true, 'System Design': true, Experience: true });
  const [finishedTypes, setFinishedTypes] = useState({ Coding: false, 'System Design': false, Experience: false });
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [emptySubmitIndex, setEmptySubmitIndex] = useState(null);

  const updateQuestion = (index, updates) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const handleToggleType = (type) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleLanguageChange = (index, language) => {
    updateQuestion(index, { language });
  };

  const generateQuestion = async (type) => {
    if (!user?.uid || !app?.id || !selectedResume) return;

    setLoading(true);
    try {
      const data = await generateInterviewQuestion({
        uid: user.uid,
        applicationId: app.id,
        resumeTag: selectedResume,
        type,
      });
      const questionText = data?.question || data?.description || 'Failed to generate question. Please try again.';
      const context = data?.context || null;

      return {
        type,
        title: `${type} Question`,
        description: questionText,
        context,
        userInput: '',
        language: type === 'Coding' ? 'javascript' : undefined,
        submitted: false,
        aiAnalysis: '',
        aiSolution: '',
        showSolution: false,
        generateCount: 1,
        skipped: false,
        moreQuestionClicked: false,
      };
    } catch (err) {
      console.error('Error generating question:', err);
      return {
        type,
        title: `${type} Question`,
        description: 'Failed to generate question. Please try again.',
        context: null,
        userInput: '',
        submitted: false,
        aiAnalysis: '',
        aiSolution: '',
        showSolution: false,
        generateCount: 1,
        skipped: false,
        moreQuestionClicked: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const handleTry = (index) => {
    updateQuestion(index, { submitted: 'pending' });
  };

  const handleSubmit = async (index) => {
  const question = questions[index];
  const answer = question.userInput.trim();

  if (!answer) {
    setEmptySubmitIndex(index);
    return;
  }

  setEmptySubmitIndex(null);
  updateQuestion(index, { submitted: 'processing' });

  try {
    // Step 1: Analyze the user's answer
    const analysisData = await analyzeAnswer({
      question: question.description,
      userAnswer: answer,
      type: question.type,
      context: question.context,
    });

    const aiAnalysis = typeof analysisData.analysis === 'string'
      ? analysisData.analysis
      : JSON.stringify(analysisData.analysis);

    // Step 2: Generate the solution even if user doesn't click "Show AI Solution"
    let aiSolution = '';
    try {
      const solutionData = await generateSolution({
        question: question.description,
        type: question.type,
        context: question.context,
        language: question.language || 'javascript',
      });

      aiSolution = solutionData.solution || 'No solution returned.';
    } catch (err) {
      console.error('Error generating solution:', err);
      aiSolution = 'Failed to generate solution.';
    }

    // Step 3: Save to backend
    await saveUserAnswer({
      uid: user.uid,
      applicationId: app?.id,
      type: question.type,
      question: question.description,
      userAnswer: answer,
      aiAnalysis,
      aiSolution,
      language: question.language,
      positionDisplay: `${app?.jobTitle} at ${app?.company}`,
      context: question.context || {},
    });

    // Step 4: Update the UI
    updateQuestion(index, {
      submitted: true,
      aiAnalysis,
      aiSolution,
    });
  } catch (err) {
    console.error('Error submitting answer:', err);
    updateQuestion(index, {
      submitted: true,
      aiAnalysis: 'Error analyzing your answer. Please try again.',
    });
  }
};


  const handleChangeInput = (index, value) => {
    updateQuestion(index, { userInput: value });
  };

  const handleShowSolution = async (index) => {
    const question = questions[index];
    if (!question.aiSolution && !question.showSolution) {
      updateQuestion(index, { showSolution: 'loading' });
      try {
        const data = await generateSolution({
          question: question.description,
          type: question.type,
          context: question.context,
          language: question.type === 'Coding' ? question.language || 'javascript' : undefined
        });

        updateQuestion(index, {
          aiSolution: data.solution || 'No solution received.',
          showSolution: true,
        });
      } catch (err) {
        console.error('Error generating solution:', err);
        updateQuestion(index, {
          aiSolution: 'Failed to generate solution. Please try again.',
          showSolution: true,
        });
      }
    } else {
      updateQuestion(index, { showSolution: !question.showSolution });
    }
  };

  const handleSkip = (index) => {
    updateQuestion(index, { skipped: true, moreQuestionClicked: false });
  };

  const appendMoreQuestion = async (type) => {
    const newQuestion = await generateQuestion(type);
    if (!newQuestion) return;

    setQuestions(prev => {
      const filtered = prev.filter(q => q.type === type);
      const maxCount = filtered.reduce((max, q) => Math.max(max, q.generateCount), 0);
      const updatedQuestion = { ...newQuestion, generateCount: maxCount + 1 };

      const lastIndex = prev.reduce((lastIdx, q, idx) => q.type === type ? idx : lastIdx, -1);
      return [
        ...prev.slice(0, lastIndex + 1),
        updatedQuestion,
        ...prev.slice(lastIndex + 1),
      ];
    });
  };

  const handleMoreQuestionClick = async (index) => {
    const type = questions[index].type;
    await appendMoreQuestion(type);
    updateQuestion(index, { moreQuestionClicked: true });
  };

  const handleRegenerate = async (index) => {
    const type = questions[index].type;
    const newQuestion = await generateQuestion(type);
    if (!newQuestion) return;

    updateQuestion(index, {
      ...newQuestion,
      generateCount: 1,
      skipped: false,
      moreQuestionClicked: false,
    });
  };

  const handleFinish = (type) => {
    setFinishedTypes(prev => ({ ...prev, [type]: true }));
  };

  // New: handle Try Similar Question
  const handleTrySimilarQuestion = async (index) => {
  const question = questions[index];
  if (!question || !user?.uid || !question.context) return;

  setLoading(true);
  try {
    const similar = await generateSimilarQuestion({
      previousQuestion: question.description,
      type: question.type,
      context: question.context,
    });

    if (!similar || !similar.description) {
      alert('Failed to generate similar question.');
      return;
    }

    const newQuestion = {
      type: similar.type,
      title: similar.title || `${similar.type} Similar Question`,
      description: similar.description,
      context: question.context, 
      userInput: '',
      language: similar.type === 'Coding' ? 'javascript' : undefined,
      submitted: false,
      aiAnalysis: '',
      aiSolution: '',
      showSolution: false,
      generateCount: 1,
      skipped: false,
      moreQuestionClicked: false,
    };

    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions.splice(index + 1, 0, newQuestion);
      return newQuestions;
    });
  } catch (err) {
    console.error('Error generating similar question:', err);
    alert('Failed to generate similar question.');
  } finally {
    setLoading(false);
  }
};

  const generateAllQuestions = async () => {
    if (!user?.uid || !app?.id || !selectedResume) {
      alert('Please select a resume first');
      return;
    }

    setLoading(true);
    try {
      const newQuestions = [];
      for (const [type, selected] of Object.entries(selectedTypes)) {
        if (selected) {
          const question = await generateQuestion(type);
          if (question) newQuestions.push(question);
        }
      }

      setQuestions(newQuestions);
      setFinishedTypes(prev =>
        Object.fromEntries(Object.keys(prev).map(type =>
          [type, selectedTypes[type] ? false : prev[type]]
        ))
      );
      setQuestionsGenerated(true);
    } catch (err) {
      console.error('Error generating questions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-6">Mock Interview Question from AI</h1>

      {/* Position Info */}
      <div className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">Position</p>
          <p className="text-gray-800 font-medium">{app?.jobTitle} at {app?.company}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Resume Tag</p>
          <p className="text-gray-800 font-medium">{selectedResume || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Generated</p>
          <p className="text-gray-800 font-medium">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="bg-white border rounded-lg p-4 w-full lg:w-64">
          <p className="text-sm font-semibold mb-2">Filters & Options</p>
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Selected Resume</p>
            <p className="text-sm font-medium">{selectedResume || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Question Types</p>
            {['Coding', 'System Design', 'Experience'].map((type) => (
              <div key={type} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={selectedTypes[type]}
                  onChange={() => handleToggleType(type)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </div>
            ))}
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
            onClick={generateAllQuestions}
            disabled={loading || !selectedResume}
          >
            {loading ? 'Generating...' : 'Generate All Types Questions'}
          </button>
        </div>

        {/* Questions */}
        <div className="flex-1 space-y-4">
          {!questionsGenerated ? (
            <div className="text-center text-gray-500 mt-8">
              Click "Generate All Types Questions" to see AI-generated questions.
            </div>
          ) : questions.filter(q => selectedTypes[q.type]).length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No questions available. Please select at least one question type.
            </div>
          ) : (
            questions
              .filter(q => selectedTypes[q.type])
              .map((q, idx) => {
                if (finishedTypes[q.type]) {
                  return (
                    <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm text-center text-gray-700">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          q.type === 'Coding' ? 'bg-green-100 text-green-700' :
                          q.type === 'System Design' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {q.type}
                      </span>
                      <p className="mt-2 font-semibold">✅ {q.type} type finished.</p>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          q.type === 'Coding' ? 'bg-green-100 text-green-700' :
                          q.type === 'System Design' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {q.type}
                      </span>

                      <button
                        onClick={() => handleShowSolution(idx)}
                        className="bg-gray-100 text-gray-800 px-2 py-1 mb-2 rounded text-xs hover:bg-gray-200"
                        disabled={q.showSolution === 'loading'}
                      >
                        {q.showSolution === 'loading' ? 'Loading...' : 
                         q.showSolution ? 'Hide AI Solution' : 'Show AI Solution'}
                      </button>
                    </div>
                    <p className="font-semibold text-gray-800">{q.title}</p>
                    <p className="text-sm text-gray-700 mb-3">{q.description}</p>

                    {q.showSolution && q.aiSolution && (
                      <AISolutionBox content={q.aiSolution} />
                    )}

                    {q.submitted === 'pending' && (
                      <div className="mb-3">
                        {q.type === 'Coding' ? (
                          <>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              Choose Language:
                            </label>
                            <select
                              value={q.language}
                              onChange={e => handleLanguageChange(idx, e.target.value)}
                              className="mb-2 block w-full border rounded px-2 py-1 text-sm"
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                              <option value="c">C</option>
                            </select>
                            <CodeEditor
                              value={q.userInput}
                              onChange={val => handleChangeInput(idx, val)}
                              language={q.language}
                            />
                          </>
                        ) : (
                          <textarea
                            value={q.userInput}
                            onChange={e => handleChangeInput(idx, e.target.value)}
                            className="w-full border rounded px-2 py-2 text-sm mb-2 min-h-[100px] resize-y"
                            placeholder="Type your answer here..."
                          />
                        )}

                        {emptySubmitIndex === idx && (
                          <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-2">
                            Please don't submit an empty answer.
                          </div>
                        )}
                        <button
                          onClick={() => handleSubmit(idx)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => updateQuestion(idx, { submitted: false })}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                        >
                          Try it later
                        </button>
                      </div>
                    )}

                    {q.submitted === 'processing' && (
                      <div className="text-center py-4">
                        <p className="text-gray-600">Analyzing your answer...</p>
                      </div>
                    )}

                    {q.submitted === true && (
                      <>
                        <AIAnalysisBox content={q.aiAnalysis} />
                        <button
                          onClick={() => handleFinish(q.type)}
                          className="bg-gray-400 text-white px-3 py-1 mb-2 rounded text-sm"
                        >
                          Finished
                        </button>

                        {/* Try Similar Question button */}
                        <button
                          onClick={() => handleTrySimilarQuestion(idx)}
                          className="bg-indigo-600 text-white px-3 py-1 mb-2 rounded text-sm hover:bg-indigo-700"
                          disabled={loading}
                        >
                          Try Similar Question
                        </button>
                      </>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {/* When not submitted & not skipped */}
                      {q.submitted === false && !q.skipped && (
                        <>
                          <button
                            onClick={() => handleTry(idx)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Try This Question
                          </button>
                          {q.generateCount === 5 && (
                            <button
                              onClick={() => handleFinish(q.type)}
                              className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                            >
                              Finished
                            </button>
                          )}
                          {q.generateCount < 5 && (
                            <button
                              onClick={() => handleSkip(idx)}
                              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                            >
                              Skip
                            </button>
                          )}
                        </>
                      )}

                      {/* When skipped & not submitted */}
                      {q.submitted === false && q.skipped && (
                        <>
                          <button
                            onClick={() => handleTry(idx)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Try It Now
                          </button>
                          {!q.moreQuestionClicked && (
                            <button
                              onClick={() => handleMoreQuestionClick(idx)}
                              className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200"
                            >
                              More Question
                            </button>
                          )}
                        </>
                      )}

                      {q.generateCount === 5 && q.submitted === true && (
                        <button
                          onClick={() => handleRegenerate(idx)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Regenerate Question
                        </button>
                      )}
                      {q.submitted === true && q.generateCount < 5 && (
                        <button
                          onClick={() => appendMoreQuestion(q.type)}
                          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200"
                        >
                          More Question
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
