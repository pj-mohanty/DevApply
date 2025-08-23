import { useEffect, useState } from 'react';
import { getJournalEntries } from '../utils/api';
import JobCard from '../components/JobCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function JournalPage() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.uid) {
      getJournalEntries(user.uid)
      .then(setJobs)
      .catch(err => console.error('Error loading journal:', err));
    }
    
  }, [user]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interview Journal</h1>
        <button 
        onClick={() => navigate('/interview')}
        className="bg-blue-600 text-white px-4 py-2 rounded">+ New Entry</button>
      </div>

      {jobs.map((job, index) => (
      <JobCard
        key={job.id || `unlinked-${index}`} // fallback key for unlinked entries
        job={job}
      />
))}
    </div>
  );
}