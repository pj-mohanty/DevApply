import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import Tag from './Tag';
import 'highlight.js/styles/github-dark.css';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { deleteInterviewEntry } from '../utils/api';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useState } from 'react';

export default function EntryCard({ entry,onDelete}) {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="border-t border-gray-200 w-full">
      <div className="py-6 px-5">
        {/* Interview Name */}
        {entry.interviewName && (
          <div className="text-base font-semibold text-gray-800 mb-1">
            {entry.interviewName}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
          <div className="flex items-center gap-2">
            <Tag type={entry.type} />
            <span>{entry.interviewDate}</span>
          </div>
          <div className="flex gap-2">
            <button 
            onClick={() => navigate(`/interview/${entry.id}`)} 
            className="flex items-center gap-1 bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded hover:bg-blue-700">👁 View</button>
            <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-1 bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded hover:bg-blue-700"
          >
            🗑 Delete
          </button>
          </div>
        </div>

        {/* Question */}
        <h4 className="font-medium text-gray-900 mb-2">{entry.question}</h4>

        {/* Markdown Content */}
        <div className="prose prose-slate prose-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >  
            {entry.response}
          </ReactMarkdown>
        </div>

        {/* Custom Delete Dialog */}
        <ConfirmDeleteDialog
          isOpen={showDialog}
          onConfirm={async () => {
            try {
              await deleteInterviewEntry(entry.id);
              setShowDialog(false);
              if (onDelete) {
                onDelete(entry.id);
              } else {
                navigate(0);
              }
            } catch (err) {
              alert('Failed to delete. Please try again.');
              console.error(err);
            }
          }}
          onCancel={() => setShowDialog(false)}
        />
      </div>
    </div>
  );
}