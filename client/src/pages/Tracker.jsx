import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_URL = process.env.REACT_APP_API_URL;

function Tracker() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [resumes, setResumes] = useState([]); 
  const [resumeAlertAppId, setResumeAlertAppId] = useState(null);
  const dropdownRefs = useRef({});
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchResumes(user.uid);
    }
  }, [user]);

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
    function handleClickOutside(event) {
      if (
        openDropdown !== null &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown].contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const fetchApplications = async () => {
    if (!user) return;
    
    try {
      const res = await axios.get(`${BASE_URL}/api/applications?uid=${user.uid}`);
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/applications/${id}`);
      setApplications(applications.filter(app => app.id !== id));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };
  const handleMockInterview = (app) => {
    if (!app.resume) {
      alert('Please add a resume to this application before starting a mock interview.');
      return;
    }
    
    if (!app.jobDescription) {
      alert('Please add a job description to this application before starting a mock interview.');
      return;
    }
    
    navigate('/mock-interview', { state: { app } });
  };

  const handleResumeChange = async (appId, newResume) => {
    try {
      const app = applications.find(a => a.id === appId);
      if (!app) return;
      const res = await axios.put(`${BASE_URL}/api/applications/${appId}`, {
        jobTitle: app.jobTitle || '',
        company: app.company || '',
        status: app.status || '',
        dateApplied: app.dateApplied || '',
        applicationLink: app.applicationLink || '',
        jobDescription: app.jobDescription || '',
        resume: newResume || '',
      });
      setApplications(applications.map(a => a.id === appId ? res.data : a));
    } catch (err) {
      console.error('Failed to update resume for application:', err);
    }
  };

  // Stats
  const total = applications.length;
  const applied = applications.filter(app => app.status === 'Applied').length;
  const interviewScheduled = applications.filter(app => app.status === 'Interview Scheduled').length;
  const interviewCompleted = applications.filter(app => app.status === 'Interview Completed').length;
  const offers = applications.filter(app => app.status === 'Offer').length;
  const rejected = applications.filter(app => app.status === 'Rejected').length;

  // Filtered list
  const filteredApps = selectedStatus === 'All'
    ? applications
    : applications.filter(app => app.status === selectedStatus);

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-[100vh]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Application Tracker</h1>
        <button
          onClick={() => navigate('/applicationmanager')}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Application
        </button>
      </div>


      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          ['Total Applications', total, '💼', 'bg-blue-100', 'All'],
          ['Applied', applied, '📝', 'bg-yellow-100', 'Applied'],
          ['Interview Scheduled', interviewScheduled, '🗓️', 'bg-purple-100', 'Interview Scheduled'],
          ['Interview Completed', interviewCompleted, '✅', 'bg-indigo-100', 'Interview Completed'],
          ['Offers', offers, '🏆', 'bg-green-100', 'Offer'],
          ['Rejected', rejected, '❌', 'bg-red-100', 'Rejected']
        ].map(([label, count, icon, bg, status], idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedStatus(status)}
            className={`bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm transition-all duration-150 focus:outline-none ${selectedStatus === status ? 'ring-2 ring-blue-400 border-blue-400' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className={`p-2 rounded-full ${bg} text-lg`}>{icon}</div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-md font-semibold text-gray-800">Job Applications</h2>
          <select
            className="text-sm border rounded px-3 py-1 text-gray-700"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interview Completed">Interview Completed</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Job Title</th>
              <th className="px-6 py-3 text-left">Company</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Date </th>
              <th className="px-6 py-3 text-left">Resume</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No applications found.
                </td>
              </tr>
            ) : (
              filteredApps.map((app, index) => (
                <tr key={app.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800">{app.jobTitle}</td>
                  <td className="px-6 py-4">{app.company}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      app.status === 'Offer' ? 'bg-green-100 text-green-700' :
                      app.status === 'Interview Completed' ? 'bg-indigo-100 text-indigo-700' :
                      app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-700' :
                      app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                    <td className="px-6 py-4 text-gray-700">{
                     (() => {
                       if (app.dateApplied) {
                         const dt = new Date(app.dateApplied);
                         if (!isNaN(dt)) {
                           return dt.toLocaleDateString();
                         }
                       }
                       return app.dateApplied || '';
                     })()
                   }</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={app.resume || ''}
                        onChange={e => handleResumeChange(app.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select Resume</option>
                        {resumes.map((resume, idx) => (
                          <option key={resume.id} value={resume.url}>
                            {resume.tag || `Resume ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                      {app.resume ? (
                        <a
                          href={`/resume/view/${app.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-purple-600 text-xs px-2 py-1 border border-purple-200 rounded bg-purple-50 hover:bg-purple-100"
                        >
                          View
                        </a>
                      ) : resumeAlertAppId === app.id ? (
                        <div className="ml-1 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 flex items-center gap-1">
                          <span className="text-yellow-600 text-xs">⚠️</span>
                          <span className="text-yellow-800 text-xs">Select resume first</span>
                          <button
                            onClick={() => setResumeAlertAppId(null)}
                            className="text-yellow-600 hover:text-yellow-800 text-xs ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button
                      onClick={() => navigate('/applicationmanager', { state: { app } })}
                      className="text-blue-600 hover:text-blue-800 text-lg"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-red-600 hover:text-red-800 text-lg"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => handleMockInterview(app)}
                      className="text-green-600 hover:text-green-800 text-lg"
                    >
                      🤖
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tracker;
