export default function EducationSection({ data, onChange, onAdd, onDelete }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2 text-blue-600">🎓</span> Education
        </h2>
        <button onClick={onAdd} className="text-blue-600 hover:underline">
          + Add Another
        </button>
      </div>

      {(data || []).map((edu, index) => (
        <div
          key={index}
          className="relative border border-gray-300 rounded-lg p-4 mb-6 shadow-sm bg-white"
        >
          {/* 🗑️ Delete button */}
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
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                placeholder="e.g., Stanford University"
                value={edu.school}
                onChange={(e) => onChange('education', index, 'school', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Degree */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input
                type="text"
                placeholder="e.g., B.S. in Computer Science"
                value={edu.degree}
                onChange={(e) => onChange('education', index, 'degree', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input
                type="text"
                placeholder="e.g., 2024"
                value={edu.year}
                onChange={(e) => onChange('education', index, 'year', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g., Palo Alto, CA"
                value={edu.location}
                onChange={(e) => onChange('education', index, 'location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                placeholder="e.g., GPA, honors, relevant coursework"
                value={edu.notes}
                onChange={(e) => onChange('education', index, 'notes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}