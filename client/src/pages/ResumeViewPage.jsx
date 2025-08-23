// src/pages/ResumeViewPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getResumeByTag } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';

export default function ResumeViewPage() {
  const { tag } = useParams();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState(null);
  const navigate = useNavigate();
  const resumeRef = useRef();

  const handleDownloadPDF = () => {
    const element = resumeRef.current;
    const elementsToHide = element.querySelectorAll('.pdf-hide');
    elementsToHide.forEach(el => el.style.display = 'none');

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${resumeData.fullName || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      })
      .from(element)
      .save()
      .then(() => {
        elementsToHide.forEach(el => (el.style.display = ''));
      });
  };

  useEffect(() => {
    if (!user || !tag) return;
    getResumeByTag(user.uid, tag)
      .then(data => setResumeData(data))
      .catch(err => console.error('Error loading resume:', err));
  }, [user, tag]);
  
  if (!resumeData) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 bg-white rounded shadow">
      {/* Top control buttons */}
      <div className="flex justify-between mb-6 pdf-hide">
        <button
          onClick={() => navigate('/resume/versions')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate(`/resume/edit/${tag}`)}
          className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded hover:bg-gray-100"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Resume content */}
      <div ref={resumeRef} className="space-y-6 text-gray-800">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">{resumeData.fullName}</h1>
          <p className="text-sm mt-1">
            {resumeData.email} • {resumeData.phone} • {resumeData.linkedin} •{' '}
            {resumeData.github} • {resumeData.website}
          </p>
        </div>

        {/* Education */}
        <section>
          <div className="mt-6 mb-1">
            <h2 className="text-xl font-semibold mb-0.5">Education</h2>
            <div className="h-[1px] bg-gray-300"></div>
          </div>
          {resumeData.education?.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between font-medium">
                <div>
                  {edu.degree}, {edu.school}
                </div>
                <div className="text-sm font-bold text-gray-600">
                  {edu.year}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                {edu.notes && (
                                <div className="text-sm text-gray-500 italic">{edu.notes}</div>
                              )}
                <div className="italic">{edu.location}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Experience */}
        <section>
          <div className="mt-6 mb-2">
            <h2 className="text-xl font-semibold">Experience</h2>
            <div className="h-[1px] bg-gray-300 mt-1"></div>
          </div>
          {resumeData.experience?.map((exp, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between font-medium">
                <div>{exp.title}</div>
                <div className="text-sm text-gray-600">{exp.start} – {exp.end} </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 italic">
                <div>{exp.company}</div>
                <div>{exp.location}</div>
              </div>
              <p className="text-sm mt-1">{exp.desc}</p>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section>
          <div className="mt-6 mb-2">
            <h2 className="text-xl font-semibold">Projects</h2>
            <div className="h-[1px] bg-gray-300 mt-1"></div>
          </div>
          {resumeData.projects?.map((proj, idx) => (
            <div key={idx} className="mb-2">
              <div className="font-medium">
                {proj.name}
              </div>
              <div className="text-sm text-gray-700">Tech: {proj.tech}</div>
              <div className="text-sm">{proj.desc}</div>
              <div className="text-sm text-blue-600">
                GitHub: {proj.github} | Demo: {proj.demo}
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        {resumeData.skills?.trim() && (
          <section>
            <div className="mt-6 mb-2">
              <h2 className="text-xl font-semibold">Skills</h2>
              <div className="h-[1px] bg-gray-300 mt-1"></div>
            </div>
            <p className="text-sm">
              {resumeData.skills
                .split(',')
                .map((skill) => skill.trim())
                .filter((skill) => skill !== '')
                .join(' • ')}
            </p>
          </section>
        )}

        {/* Awards */}
        {resumeData.awards?.length > 0 && (
          <section>
            <div className="mt-6 mb-2">
              <h2 className="text-xl font-semibold">Awards & Certifications</h2>
              <div className="h-[1px] bg-gray-300 mt-1"></div>
            </div>
            {resumeData.awards.map((award, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between font-medium">
                  <div>{award.name}</div> 
                  <div>{award.date} </div>
                </div>
                <div className="text-sm text-gray-600 italic">issued by {award.issuer}</div>
                <div className="text-sm text-gray-600">
                  {award.notes}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Export PDF Button */}
      <div className="flex justify-center mt-6 pdf-hide">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          📄 Export PDF
        </button>
      </div>
    </div>
  );
}