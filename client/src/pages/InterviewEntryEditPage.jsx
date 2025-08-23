import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getInterviewEntryById, updateInterviewEntry } from '../utils/api';
import axios from 'axios';
import {useAuth} from '../context/AuthContext';

export default function InterviewEntryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } =useAuth();

  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    applicationId: '',
    company: '',
    jobTitle: '',
    interviewName: '',
    questionType: 'Coding',
    question: '',
    response: '',
    notes: '',
    link: '',
    interviewDate: ''
  });

  const pacificToday = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles',
  });

  useEffect(() => {
    getInterviewEntryById(id).then(data => {
      setFormData({
        applicationId: data.applicationId || '',
        company: data.company || '',
        jobTitle: data.jobTitle || '',
        interviewName: data.interviewName || '',
        questionType: data.questionType || 'Coding',
        question: data.question || '',
        response: data.response || '',
        notes: data.notes || '',
        link: data.link || '',
        interviewDate: data.interviewDate || ''
      });
    });
  }, [id]);

  useEffect(() => {
    if (!user) return;

    axios.get(`${API_URL}/api/applications?uid=${user.uid}`) //add uid to get API
      .then(res => setApplications(res.data))
      .catch(err => console.error('Failed to load applications:', err));
  }, [API_URL,user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'applicationId') {
      const selected = applications.find(app => app.id === value);
      setFormData(prev => ({
        ...prev,
        applicationId: value,
        company: selected?.company || '',
        jobTitle: selected?.jobTitle || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateInterviewEntry(id, {
        ...formData,
        type: formData.questionType,
        date: formData.interviewDate
      });
      navigate(`/interview/${id}`);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update entry. Please try again.');
    }
  };

  const insertMarkdown = (startWrapper, cursorOffset = 0, endWrapper = '') => {
    const textarea = document.getElementById('response-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = formData.response.substring(0, start);
    const after = formData.response.substring(end);
    const inserted = startWrapper + endWrapper;

    const newValue = before + inserted + after;
    setFormData((prev) => ({ ...prev, response: newValue }));

    setTimeout(() => {
      textarea.focus();
      const pos = start + cursorOffset;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6 bg-white shadow-md rounded-md mt-10">
       {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Application */}
        <div>
          <label className="block font-medium mb-1">Job Application</label>
          <select
            name="applicationId"
            value={formData.applicationId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select a job application</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.company} - {app.jobTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Interview Name */}
        <div>
          <label className="block font-medium mb-1">Interview Name</label>
          <input
            type="text"
            name="interviewName"
            value={formData.interviewName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block font-medium mb-1">Question Type</label>
          <div className="flex gap-6">
            {['Coding', 'System Design', 'Behavioral'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="questionType"
                  value={type}
                  checked={formData.questionType === type}
                  onChange={handleChange}
                />
                <span className="ml-2">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interview Date */}
        <div>
          <label className="block font-medium mb-1">Interview Date</label>
          <input
            type="date"
            name="interviewDate"
            value={formData.interviewDate}
            onChange={handleChange}
            max={pacificToday}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Question */}
        <div>
          <label className="block font-medium mb-1">Question</label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Response */}
        <div>
          <label className="block font-medium mb-1">Response</label>
          <div className="flex gap-2 mb-2">
            <button type="button" className="px-2 py-1 border rounded text-sm" onClick={() => insertMarkdown('`', 1, '`')}>&lt;/&gt; Code</button>
            <button type="button" className="px-2 py-1 border rounded text-sm font-bold" onClick={() => insertMarkdown('**', 2, '**')}>B Bold</button>
            <button type="button" className="px-2 py-1 border rounded text-sm italic" onClick={() => insertMarkdown('*', 1, '*')}>I Italic</button>
            <button type="button" className="px-2 py-1 border rounded text-sm" onClick={() => insertMarkdown('\n```\n', 5, '\n```')}>&gt; Code Block</button>
          </div>
          <textarea
            id="response-textarea"
            name="response"
            value={formData.response}
            onChange={handleChange}
            rows="6"
            className="w-full border rounded px-3 py-2 font-mono"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium mb-1">Notes & Reflection</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block font-medium mb-1">Link to Similar Problem</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}