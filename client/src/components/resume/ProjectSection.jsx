export default function ProjectSection({ data, onChange, onAdd, onDelete }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2 text-blue-600">💻</span> Projects
        </h2>
        <button onClick={onAdd} className="text-blue-600 hover:underline">
          + Add Another
        </button>
      </div>

      {(data || []).map((proj, index) => (
        <div
          key={index}
          className="relative border border-gray-300 rounded-lg p-4 mb-6 shadow-sm"
        >
          {/* ❌ Delete button (second and later only) */}
          {index > 0 && (
            <button
              onClick={() => onDelete(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              title="Delete this project"
            >
              ❌
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                placeholder="e.g., DevApply Resume Builder"
                value={proj.name}
                onChange={(e) => onChange('projects', index, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Technologies Used */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
              <input
                type="text"
                placeholder="e.g., React, Node.js, MongoDB"
                value={proj.tech}
                onChange={(e) => onChange('projects', index, 'tech', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label 
                htmlFor={`project-desc-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
              Description
              </label>
              <textarea
                id={`project-desc-${index}`}
                placeholder="Describe the project, goal, your role, challenges, and results"
                value={proj.desc}
                onChange={(e) => onChange('projects', index, 'desc', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* GitHub Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Link <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., https://github.com/username/project"
                value={proj.github}
                onChange={(e) => onChange('projects', index, 'github', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Live Demo Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Live Demo Link <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., https://yourapp.vercel.app"
                value={proj.demo}
                onChange={(e) => onChange('projects', index, 'demo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}