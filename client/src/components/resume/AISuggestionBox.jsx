import { useState } from 'react';
import { getAISuggestion } from '../../utils/api';

export default function AISuggestionBox({ formData }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestion = async () => {
    if (!formData) return;
    setLoading(true);

    try {
      const feedback = await getAISuggestion(formData); 

      setSuggestion({
        content: feedback,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error(err);
      alert('Failed to generate suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-900">💡 AI Suggestion</h2>
        <button
          onClick={generateSuggestion}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Generating...' : '✨ Generate Suggestion'}
        </button>
      </div>

      {!suggestion ? (
        <p className="text-gray-500 text-sm">
          No AI suggestion yet. Click the button above to generate one!
        </p>
      ) : (
        <div className="border rounded-xl p-4 bg-white shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-blue-700">AI Suggestion</p>
            <p className="text-xs text-gray-400">
              {suggestion.createdAt.toLocaleString()}
            </p>
          </div>
          <ul className="list-disc list-inside text-gray-800 whitespace-pre-wrap text-sm">
            {suggestion.content.split('\n').map((line, idx) =>
              line.trim() ? <li key={idx}>{line.replace(/^[-•\s]+/, '')}</li> : null
            )}
          </ul>
        </div>
      )}
    </div>
  );
}