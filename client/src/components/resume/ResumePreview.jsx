export default function ResumePreview({ formData }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
      <div className="text-sm text-gray-800 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-bold">{formData.fullName}</h3>
          <p className="text-gray-700">{formData.email} | {formData.phone}</p>
          <p className="text-gray-600">
            {formData.linkedin && <span>{formData.linkedin} | </span>}
            {formData.github && <span>{formData.github} | </span>}
            {formData.website && <span>{formData.website}</span>}
          </p>
        </div>

        {/* Education */}
        {formData.education?.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">🎓 Education</h4>
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <p className="font-medium">{edu.school} — {edu.degree} ({edu.year})</p>
                <p className="text-sm text-gray-600">{edu.location}</p>
                {edu.notes && <p className="text-sm italic text-gray-500">{edu.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {formData.experience?.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">💼 Work Experience</h4>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-3">
                <p className="font-medium">
                  {exp.title} at {exp.company} ({exp.start} - {exp.end || 'present' })
                </p>
                <p className="text-sm text-gray-600">{exp.location}</p>
                <p className="text-sm">{exp.desc}</p>
                {exp.achievements && (
                  <p className="text-sm italic text-gray-500 whitespace-pre-line">
                    {exp.achievements}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {formData.projects?.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">💻 Projects</h4>
            {formData.projects.map((proj, index) => (
              <div key={index} className="mb-3">
                <p className="font-medium">{proj.name}</p>
                <p className="text-sm">{proj.desc}</p>
                <p className="text-sm italic text-gray-600">Tech Used: {proj.tech}</p>
                <div className="text-sm space-x-2 mt-1">
                  {proj.github && (
                    <a
                      className="text-blue-600 hover:underline"
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  )}
                  {proj.demo && (
                    <a
                      className="text-blue-600 hover:underline"
                      href={proj.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {formData.skills && formData.skills.trim() !== '' && (
          <div>
            <h4 className="font-semibold text-md mb-2">🛠️ Skills</h4>
            <p className="text-sm text-gray-800">
              {formData.skills
                .split(',')
                .map((skill) => skill.trim())
                .filter((skill) => skill !== '')
                .join(' • ')}
            </p>
          </div>
        )}

        {/* Awards */}
        {formData.awards?.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">🏆 Awards & Certifications</h4>
            {formData.awards.map((award, index) => (
              <div key={index} className="mb-3">
                <p className="font-medium">
                  {award.name} — {award.issuer} ({award.date})
                </p>
                {award.notes && <p className="text-sm italic text-gray-600">{award.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}