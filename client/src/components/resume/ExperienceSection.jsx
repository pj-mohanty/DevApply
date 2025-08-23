export default function ExperienceSection({ data, onChange, onAdd, onDelete }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2 text-blue-600">💼</span> Work Experience
        </h2>
        <button onClick={onAdd} className="text-blue-600 hover:underline">
          + Add Another
        </button>
      </div>

      {(data || []).map((exp, index) => (
        <div
          key={index}
          className="relative border border-gray-300 rounded-lg p-4 mb-6 shadow-sm"
        >
          {/* ❌ Delete button (only for second item and beyond) */}
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
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g., Google"
                value={exp.company}
                onChange={(e) => onChange('experience', index, 'company', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g., Software Engineer Intern"
                value={exp.title}
                onChange={(e) => onChange('experience', index, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={exp.start}
                onChange={(e) => onChange('experience', index, 'start', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={exp.end}
                onChange={(e) => onChange('experience', index, 'end', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Mountain View, CA"
              value={exp.location}
              onChange={(e) => onChange('experience', index, 'location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="mt-4">
            <label 
              htmlFor={`experience-desc-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
            Description
            </label>
            <textarea
              id={`experience-desc-${index}`}
              placeholder="Describe your role, responsibilities, and technologies used"
              value={exp.desc}
              onChange={(e) => onChange('experience', index, 'desc', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Key Achievements */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
            <textarea
              placeholder="e.g., • Improved app performance by 30%..."
              value={exp.achievements}
              onChange={(e) => onChange('experience', index, 'achievements', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}