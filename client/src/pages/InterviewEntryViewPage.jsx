import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getInterviewEntryById } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function InterviewEntryViewPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getInterviewEntryById(id)
      .then(data => {
        setEntry(data);
        setLoading(false);
      })
      .catch(() => {
        alert('Failed to load entry');
        setLoading(false);
      });
  }, [id]);

  if (loading || !entry) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6 bg-white shadow-md rounded-md mt-10">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/journal')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate(`/interview/${id}/edit`)}
          className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded hover:bg-gray-100"
        >
          ✏️ Edit
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">{entry.interviewName || 'Interview Entry'}</h1>

      {entry.company && entry.jobTitle && (
        <div>
          <label className="block font-medium mb-1">Job Application</label>
          <p className="border rounded px-3 py-2 bg-gray-50 text-gray-700">
            {entry.company} - {entry.jobTitle}
          </p>
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">Question Type</label>
        <p className="border rounded px-3 py-2 bg-gray-50 text-gray-700">{entry.type}</p>
      </div>

      <div>
        <label className="block font-medium mb-1">Interview Date</label>
        <p className="border rounded px-3 py-2 bg-gray-50 text-gray-700">{entry.interviewDate}</p>
      </div>

      <div>
        <label className="block font-medium mb-1">Question</label>
        <p className="border rounded px-3 py-2 bg-gray-50 text-gray-700">{entry.question}</p>
      </div>

      <div>
        <label className="block font-medium mb-1">Response</label>
        <div className="prose prose-slate prose-sm max-w-none border rounded px-3 py-2 bg-gray-50">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {entry?.response ?? ''}
          </ReactMarkdown>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Notes & Reflection</label>
        <textarea
          value={entry?.notes ?? ''}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Link to Similar Problem (Optional)</label>
        <input
          type="url"
          value={entry?.link ?? ''}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-100 text-blue-600"
        />
      </div>
    </div>
  );
}