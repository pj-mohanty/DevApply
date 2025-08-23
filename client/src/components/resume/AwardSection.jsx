export default function AwardSection({ data, onChange, onAdd, onDelete }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2 text-blue-600">🏆</span> Awards & Certifications
        </h2>
        <button onClick={onAdd} className="text-blue-600 hover:underline">
          + Add Another
        </button>
      </div>

      {(data || []).map((award, index) => (
        <div
          key={index}
          className="relative border border-gray-300 rounded-lg p-4 mb-6 shadow-sm"
        >
          {/* ❌ Delete button for entries beyond the first */}
          {index > 0 && (
            <button
              onClick={() => onDelete(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              title="Delete this entry"
            >
              ❌
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Award/Certificate Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Award/Certification Name
              </label>
              <input
                type="text"
                placeholder="e.g., AWS Certified Solutions Architect"
                value={award.name}
                onChange={(e) => onChange('awards', index, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
              <input
                type="text"
                placeholder="e.g., Amazon Web Services"
                value={award.issuer}
                onChange={(e) => onChange('awards', index, 'issuer', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Received */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input
                type="date"
                value={award.date}
                onChange={(e) => onChange('awards', index, 'date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Expired, with distinction..."
                value={award.notes}
                onChange={(e) => onChange('awards', index, 'notes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}