export default function BasicInfoSection({ formData, onChange }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="mr-2 text-blue-600">📘</span> Basic Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="fullName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={formData.linkedin}
            onChange={(e) => onChange('linkedin', e.target.value)}
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={formData.github}
            onChange={(e) => onChange('github', e.target.value)}
          />
        </div>

        {/* Personal Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personal Website <span className="text-gray-400">(optional)</span>
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={formData.website}
            onChange={(e) => onChange('website', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}