  import React, { useState } from 'react';
  import { useEffect } from 'react';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  import { submitInterviewEntry } from '../utils/api';
  import { useAuth } from '../context/AuthContext';

  export default function InterviewForm() {
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;
    const { user } = useAuth();

    const pacificToday = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Los_Angeles',
    });

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
      link: ''  ,
      interviewDate: ''
    });

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

    const insertMarkdown = (startWrapper,cursorOffset = 0, endWrapper = '') => {
      const textarea = document.getElementById('response-textarea');
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = formData.response.substring(0, start);
      const after = formData.response.substring(end);
      const inserted = startWrapper + endWrapper;

      const newValue = before + inserted + after;
      setFormData((prev) => ({ ...prev, response: newValue }));

      // Reset the cursor position
      setTimeout(() => {
        textarea.focus();
        const pos = start + cursorOffset;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        //await submitInterviewEntry(formData);
        await submitInterviewEntry({
          ...formData,
          uid: user.uid,    
          type: formData.questionType, // add new field
          date: formData.interviewDate // add new field
        });

        // alert('Entry saved!');
        navigate('/entry-success');
        
        setFormData({
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
      } catch (err) {
        console.error('Submission failed:', err);
        alert('Failed to save entry. Please try again.');
      }
    };

    useEffect(() => {
      if (!user) return;
      
      axios.get(`${API_URL}/api/applications?uid=${user.uid}`)
        .then(res => setApplications(res.data))
        .catch(err => console.error('Failed to load applications:', err));
    }, [API_URL,user]);
    
    return (
      <div className="w-full p-6 space-y-6 bg-white shadow-md rounded-md mt-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Application */}
          <div>
            <label className="block font-medium mb-1">
              Job Application
            </label>
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

          {/* Interview Name (Optional) */}
          <div>
            <label className="block font-medium mb-1">
              Interview Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              name="interviewName"
              value={formData.interviewName}
              onChange={handleChange}
              placeholder="e.g. Amazon SDE Phone Interview"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block font-medium mb-1">
              Question Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="questionType"
                  value="Coding"
                  checked={formData.questionType === 'Coding'}
                  onChange={handleChange}
                />
                <span className="ml-2">Coding</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="questionType"
                  value="System Design"
                  checked={formData.questionType === 'System Design'}
                  onChange={handleChange}
                />
                <span className="ml-2">System Design</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="questionType"
                  value="Behavioral"
                  checked={formData.questionType === 'Behavioral'}
                  onChange={handleChange}
                />
                <span className="ml-2">Behavioral</span>
              </label>
            </div>
          </div>

          {/* Interview Date */}
          <div>
            <label className="block font-medium mb-1">
              Interview Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              required
              max={pacificToday}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Question */}
          <div>
            <label className="block font-medium mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
              placeholder="e.g., Design a scalable URL shortener"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Response */}
          <div>
            <label className="block font-medium mb-1">
              Response <span className="text-red-500">*</span>
            </label>

            {/* Markdown Toolbar */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                className="px-2 py-1 border rounded text-sm"
                onClick={() => insertMarkdown('`', 1, '`')}
              >
                &lt;/&gt; Code
              </button>
              <button
                type="button"
                className="px-2 py-1 border rounded text-sm font-bold"
                onClick={() => insertMarkdown('**',2,'**')}
              >
                B Bold
              </button>
              <button
                type="button"
                className="px-2 py-1 border rounded text-sm italic"
                onClick={() => insertMarkdown('*',1,'*')}
              >
                I Italic
              </button>
              <button
                type="button"
                className="px-2 py-1 border rounded text-sm"
                onClick={() => insertMarkdown('\n```\n',5,'\n```')}
              >
                &gt; Code Block
              </button>
            </div>

            {/* Textarea for Markdown Input */}
            <textarea
              id="response-textarea"
              name="response"
              value={formData.response}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Write your solution here... You can use markdown formatting and code snippets."
              className="w-full border rounded px-3 py-2 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports markdown formatting. Use for code blocks.
            </p>
          </div>


          {/* Notes & Reflection */}
          <div>
            <label className="block font-medium mb-1">Notes & Reflection</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What went well? What was challenging? Key learnings..."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Link to Similar Problem */}
          <div>
            <label className="block font-medium mb-1">Link to Similar Problem (Optional)</label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://leetcode.com/problems/..."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              onClick={() => setFormData({
                applicationId: '',
                company: '',
                jobTitle: '',
                questionType: 'Coding',
                question: '',
                response: '',
                notes: '',
                link: '',
                interviewDate: ''
              })}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    );
  }