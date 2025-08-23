import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const BASE_URL = process.env.REACT_APP_API_URL;

const initialForm = {
  jobTitle: '',
  company: '',
  status: 'Applied',
  dateApplied: '', 
  dateAppliedDate: '', 
  dateAppliedTime: '', 
  applicationLink: '',
  jobDescription: '',
  resume: ''
};

function ApplicationManager() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editIndex, setEditIndex] = useState(null);
  const [resumes, setResumes] = useState([]); 
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); 
  const passedApp = location.state?.app;

  useEffect(() => {
    fetchApplications();
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      fetchApplications();
      fetchResumes(user.uid);
    }
  }, [user]);

  // Refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchApplications();
      }
    };

    const handleFocus = () => {
      fetchApplications();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchResumes = async (uid) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/resume/${uid}`);
      setResumes(res.data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  useEffect(() => {
    if (passedApp) {
      let dateAppliedDate = '', dateAppliedTime = '';
      if (passedApp.dateApplied) {
        const dt = new Date(passedApp.dateApplied);
        if (!isNaN(dt)) {
          dateAppliedDate = dt.toISOString().slice(0, 10);
          dateAppliedTime = dt.toISOString().slice(11, 16);
        }
      }
      setForm({ ...passedApp, dateAppliedDate, dateAppliedTime });
      const index = applications.findIndex(app => app.id === passedApp.id);
      if (index !== -1) {
        setEditIndex(index);
        setForm({ ...applications[index], dateAppliedDate, dateAppliedTime });
      }
    }
  }, [passedApp, applications]);

  const fetchApplications = async () => {
    if (!user) return;
    
    try {
      const res = await axios.get(`${BASE_URL}/api/applications?uid=${user.uid}`);
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'dateAppliedDate' || name === 'dateAppliedTime') {
      const newForm = { ...form, [name]: value };
      if (newForm.dateAppliedDate && newForm.dateAppliedTime) {
        newForm.dateApplied = new Date(`${newForm.dateAppliedDate}T${newForm.dateAppliedTime}`).toISOString();
      } else if (newForm.dateAppliedDate) {
        newForm.dateApplied = newForm.dateAppliedDate;
      } else {
        newForm.dateApplied = '';
      }
      setForm(newForm);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.jobTitle || !form.company || !form.dateApplied) return;

    try {
      const payload = { ...form, uid: user.uid }; // add uid

      if (editIndex !== null) {
        const appToUpdate = applications[editIndex];
        const res = await axios.put(`${BASE_URL}/api/applications/${appToUpdate.id}`, payload);
        const updated = [...applications];
        updated[editIndex] = res.data;
        setApplications(updated);
        setEditIndex(null);
      } else {
        const res = await axios.post(`${BASE_URL}/api/applications`, payload);
        setApplications(prev => [...prev, res.data]);
      }

      setForm(initialForm);
    } catch (err) {
      console.error('Error submitting application:', err);
    }
  };

  const handleEdit = index => {
    setEditIndex(index);
    setForm(applications[index]);
  };

  const handleDelete = async index => {
    const id = applications[index].id;
    try {
      await axios.delete(`${BASE_URL}/api/applications/${id}`);
      const updated = applications.filter((_, i) => i !== index);
      setApplications(updated);
      setForm(initialForm);
      if (editIndex === index) setEditIndex(null);
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };
  const handleMockInterview = (app) => {
    // Check if resume and job description are provided
    if (!app.resume) {
      alert('Please add a resume to this application before starting a mock interview.');
      return;
    }
    
    if (!app.jobDescription) {
      alert('Please add a job description to this application before starting a mock interview.');
      return;
    }
    
    // Navigate to AIInterviewPage, passing the app data in location state
    navigate('/mock-interview', { state: { app } });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Job Application Tracker</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          name="jobTitle"
          placeholder="Job Title"
          value={form.jobTitle}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="applicationLink"
          placeholder="Application Link"
          value={form.applicationLink}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {/* Resume dropdown menu */}
        <select
          name="resume"
          value={form.resume}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Resume</option>
          {resumes.map((resume, idx) => (
            <option key={resume.id} value={resume.url}>
              {resume.tag || `Resume ${idx + 1}`}
            </option>
          ))}
        </select>
        <textarea
          name="jobDescription"
          placeholder="Job Description & Position Responsibility"
          value={form.jobDescription}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        ></textarea>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option>Applied</option>
          <option>Interview Scheduled</option>
          <option>Interview Completed</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            name="dateAppliedDate"
            value={form.dateAppliedDate}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="time"
            name="dateAppliedTime"
            value={form.dateAppliedTime}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editIndex !== null ? 'Update' : 'Add'} Application
        </button>
      </form>

      <ul className="space-y-2">
        {applications.map((app, index) => {
          let dateStr = app.dateApplied;
          let timeStr = '';
          if (app.dateApplied && app.dateApplied.includes('T')) {
            const dt = new Date(app.dateApplied);
            if (!isNaN(dt)) {
              dateStr = dt.toLocaleDateString();
              timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          }
          return (
            <li key={app.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <strong>{app.jobTitle}</strong> at <em>{app.company}</em> — <span>{app.status}</span><br />
                <small>Date: {dateStr}{timeStr && ` at ${timeStr}`}</small><br />
                {app.applicationLink && (
                  <div>
                    <a href={app.applicationLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Application Link</a>
                  </div>
                )}
                {app.resume && (
                  <div>
                  <a
                    href={`/resume/view/${app.resume}`}
                    className="text-blue-600 underline"
                  >
                  View Resume
                  </a>
                  </div>
                )}
                {app.jobDescription && (
  <div className="text-gray-600 text-sm max-w-xs">
    <details>
      <summary className="cursor-pointer text-blue-600 underline">Job Description</summary>
      <div className="whitespace-pre-wrap mt-1">{app.jobDescription}</div>
    </details>
  </div>
)}

                
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button onClick={() => handleEdit(index)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(index)} className="text-red-600">Delete</button>
                <button
                  onClick={() => handleMockInterview(app)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                >
                  Mock Interview with AI
                </button>
                </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ApplicationManager;
