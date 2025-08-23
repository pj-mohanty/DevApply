export default function SkillsSection({ skills, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2 text-blue-600">🛠️</span> Skills
        </h2>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        List your skills (separated by commas)
      </label>
      <textarea
        value={skills}
        onChange={(e) => onChange('skills', e.target.value)}
        placeholder="e.g., JavaScript, React, Node.js, Python"
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}