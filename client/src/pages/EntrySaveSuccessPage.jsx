// src/pages/EntrySaveSuccessPage.jsx
import { Link } from 'react-router-dom';

export default function EntrySaveSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <div className="text-green-600 text-6xl mb-4">✓</div>
      <h1 className="text-2xl font-semibold mb-2">Interview Entry Saved!</h1>
      <p className="text-gray-600 mb-6">Your interview response was saved successfully.</p>
      <Link
        to="/journal"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Journal
      </Link>
    </div>
  );
}