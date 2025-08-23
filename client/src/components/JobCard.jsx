import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tag from './Tag';
import EntryCard from './EntryCard';

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const isUnlinked = !job.jobTitle && !job.company;
  const [entries, setEntries] = useState(job.entries);

  return (
    <div className="rounded-lg shadow mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 px-5 py-4 flex justify-between items-center">
        <div>
          {isUnlinked ? (
            <>
              <h3 className="text-lg font-semibold">Unlinked Interview Entries</h3>
              <p className="text-sm text-gray-500">{entries.length} entries</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
              <p className="text-sm text-gray-500">{job.company} • {entries.length} entries</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Add New Application button */}
          {isUnlinked && (
            <button
              onClick={() => navigate('/applicationmanager')}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
            >
              + New Application
            </button>
          )}

          {/* Status Tag */}
          {!isUnlinked && <Tag type={job.status} />}
        </div>
      </div>

      {/* Entry list */}
      <div className="bg-white">
        {entries.map((entry, index) => (
          <EntryCard
            key={index}
            entry={entry}
            showUnlinkedTag={isUnlinked || !entry.applicationId}
            onDelete={(id) => {
              setEntries(prev => prev.filter(e => e.id !== id));
            }}
          />
        ))}
      </div>
    </div>
  );
}