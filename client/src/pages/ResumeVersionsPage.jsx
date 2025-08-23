import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResumes, deleteResumeByTag } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function formatTimestamp(ts, dateOnly = false) {
  if (!ts) return '—';
  if (ts._seconds) {
    const date = new Date(ts._seconds * 1000);
    return dateOnly ? date.toLocaleDateString() : date.toLocaleString();
  }
  if (typeof ts === 'string' || typeof ts === 'number') {
    const date = new Date(ts);
    return dateOnly ? date.toLocaleDateString() : date.toLocaleString();
  }
  return '—';
}

export default function ResumeVersionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const all = await getAllResumes(user.uid);
        setResumes(all);
      } catch (err) {
        console.error('Failed to load resumes:', err);
      }
    }

    fetchData();
  }, [user]);

  const handleDelete = async (tag) => {
    const confirm = window.confirm(`Are you sure you want to delete resume "${tag}"?`);
    if (!confirm || !user?.uid) return;

    try {
      await deleteResumeByTag(user.uid, tag); 
      setResumes(resumes.filter(r => r.tag !== tag)); 
    } catch (err) {
      console.error('Failed to delete resume:', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Resume Versions</h1>
        <button
            onClick={() => navigate('/resume')}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            + Add New Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <p className="text-gray-500">No resume versions found.</p>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div key={resume.tag} className="bg-white shadow p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-blue-600">🗂️ {resume.tag}</span>
                <div className="text-xs text-gray-500 text-right">
                  🕒 Created: {formatTimestamp(resume.createdAt)}
                  <br />
                  ✏️ Updated: {formatTimestamp(resume.updatedAt)}
                </div>
                
              </div>
              <div className="text-sm text-gray-700 mb-3">
                <p><strong>Name:</strong> {resume.fullName}</p>
                <p><strong>Email:</strong> {resume.email}</p>
                <p><strong>Phone:</strong> {resume.phone}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/resume/view/${resume.tag}`)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => handleDelete(resume.tag)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}