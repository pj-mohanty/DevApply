import { useEffect, useState } from 'react';
import BasicInfoSection from './BasicInfoSection';
import EducationSection from './EducationSection';
import ExperienceSection from './ExperienceSection';
import ProjectSection from './ProjectSection';
import AwardSection from './AwardSection';
import ResumePreview from './ResumePreview';
import AISuggestionBox from './AISuggestionBox';
import { useAuth } from '../../context/AuthContext';
import { saveResume, getResumeByTag, getLatestResume,updateResumeByTag } from '../../utils/api';
import SkillsSection from './SkillsSection';
import { polishResumeByAI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';


export default function ResumeBuilder( { tag, mode = 'create' } ) {
  const { user } = useAuth();
  const  navigate  = useNavigate();
  const [selectedTag, setSelectedTag] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    education: [{ school: '', degree: '', year: '', location: '', notes: '' }],
    experience: [{ company: '', title: '', start: '', end: '', location: '', desc: '', achievements: '' }],
    projects: [{ name: '', tech: '', desc: '', github: '', demo: ''}],
    skills: '',
    awards: [{ name: '', issuer: '', date: '', notes: '' }]
  });

  const handleChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev[section]];
      updated[index][field] = value;
      return { ...prev, [section]: updated };
    });
  };

  const handleBasicChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addEntry = (section) => {
    const newEntry = { ...formData[section][0] };
    Object.keys(newEntry).forEach((k) => (newEntry[k] = ''));
    setFormData((prev) => ({ ...prev, [section]: [...prev[section], newEntry] }));
  };

  const removeEntry = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (!user || mode !== 'edit' || !tag) return;

    async function fetchResumeByTag() {
      try {
        const res = await getResumeByTag(user.uid, tag);
        if (res && !res.message) {
          setFormData({
            ...res,
            education: res.education?.length ? res.education : [{ school: '', degree: '', year: '', location: '', notes: '' }],
            experience: res.experience?.length ? res.experience : [{ company: '', title: '', start: '', end: '', location: '', desc: '', achievements: '' }],
            projects: res.projects?.length ? res.projects : [{ name: '', tech: '', desc: '', github: '', demo: '' }],
            awards: res.awards?.length ? res.awards : [{ name: '', issuer: '', date: '', notes: '' }]
          });
          setSelectedTag(res.tag || '');
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
      }
    }

    fetchResumeByTag();
  }, [user, tag, mode]);

  useEffect(() => {
    if (!user || mode !== 'create') return;

    async function fetchLatestResume() {
      try {
        const latest = await getLatestResume(user.uid);
        if (latest && !latest.message ) {
          setFormData({
            ...latest,
             education: latest.education?.length ? latest.education : [{ school: '', degree: '', year: '', location: '', notes: '' }],
             experience: latest.experience?.length ? latest.experience : [{ company: '', title: '', start: '', end: '', location: '', desc: '', achievements: '' }],
          projects: latest.projects?.length ? latest.projects : [{ name: '', tech: '', desc: '', github: '', demo: '' }],
          awards: latest.awards?.length ? latest.awards : [{ name: '', issuer: '', date: '', notes: '' }]
          });
          setSelectedTag(latest.tag || '');
        }
      } catch (err) {
        console.error('No resume found or failed to load latest:', err);
      }
    }

    fetchLatestResume();
  }, [user, mode]);

  const saveDraft = async () => {
    if (!user) return alert('Please log in.');
    if (!selectedTag.trim()) return alert('Please enter a tag.');
    const { id, ...cleanedData } = formData; 
    
    // every project must have non-empty description
    const hasEmptyProjectDesc = formData.projects.some(
      (p) => !p.desc?.trim()
    );
    if (hasEmptyProjectDesc) {
      return alert('Please fill in the description for all Projects.');
    }
    
    // every work experience mush have non-empty description
    const hasEmptyExperienceDesc = formData.experience.some(
      (e) => !e.desc?.trim()
    );
    if (hasEmptyExperienceDesc) {
      return alert('Please fill in the description for all Work Experiences.');
    }

    try {
      if (mode === 'edit'){
        // edit mode
        await updateResumeByTag(user.uid,selectedTag.trim(), cleanedData);
        alert('Resume updated!');
        navigate(`/resume/view/${selectedTag.trim()}`); // navigate to resume view page after eidt 
      }
      else{
        // create mode 
        await saveResume(user.uid, { ...cleanedData, tag: selectedTag.trim() });
        alert('Draft saved!');
      }
    } catch (error) {
      console.error(error);
      alert(error.message);// show the exact error from the backend
    }
  };

  const handlePolish = async () => {
  if (!formData) return;

  try {
    const polished = await polishResumeByAI(formData);
    setFormData(polished);  // overwrite formData with polished result
    alert('Resume polished by AI!');
  } catch (err) {
    console.error('Polish failed:', err);
    alert('Failed to polish resume.');
  }
};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            <p className="text-gray-500 text-sm">Create your professional software engineer resume</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={saveDraft}
              className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition text-sm"
            >
              💾 Save Draft
            </button>
            {/* <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              📄 Generate Resume
            </button> */}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume Tag</label>
          <input
            type="text"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
            placeholder="e.g., Fullstack, AI, Backend"
            readOnly={mode === 'edit'} 
          />
        </div>

        <div className="bg-white shadow-md p-6 rounded-lg">
          <BasicInfoSection formData={formData} onChange={handleBasicChange} />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <EducationSection
            data={formData.education}
            onChange={handleChange}
            onAdd={() => addEntry('education')}
            onDelete={(index) => removeEntry('education', index)} 
          />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <ExperienceSection
            data={formData.experience} 
            onChange={handleChange} 
            onAdd={() => addEntry('experience')} 
            onDelete={(index)=>removeEntry('experience',index)}
            />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <ProjectSection
            data={formData.projects} 
            onChange={handleChange} 
            onAdd={() => addEntry('projects')} 
            onDelete={(index) => removeEntry('projects', index)}
            />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <SkillsSection
            skills={formData.skills}
            onChange={(section, value) =>
              setFormData((prev) => ({ ...prev, [section]: value }))
            }
          />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <AwardSection 
            data={formData.awards} 
            onChange={handleChange} 
            onAdd={() => addEntry('awards')} 
            onDelete={(index) => removeEntry('awards', index)}
            />
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={saveDraft}
            className="flex items-center gap-2 px-6 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition text-sm"
          >
            💾 Save Draft
          </button>
          {/* <button
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
          >
            📄 Generate Resume
          </button> */}
          <button
            onClick={handlePolish}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:opacity-90 transition text-sm"
          >
            ✨ AI Optimize Resume
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow-md p-6 rounded-lg">
          <ResumePreview formData={formData} />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <AISuggestionBox formData={formData} />
        </div>
      </div>
    </div>
  );
}