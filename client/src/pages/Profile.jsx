import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [editable, setEditable] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    axios.get(`${BASE_URL}/api/profile?uid=${user.uid}`)
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setProfile({
          name: '',
          bio: '',
          location: '',
          skills: '',
          education: '',
          experience: '',
          linkedinId: '',
          leetcodeId: '',
          githubId: '',
          portfolioId: ''
        });
        setLoading(false);
      });
  }, [BASE_URL, user?.uid]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleEdit = async () => {
    if (editable) {
      try {
        // Only send relevant fields
        const {
          name, bio, location, skills, education, experience,
          linkedinId, leetcodeId, githubId, portfolioId
        } = profile;
        const res = await axios.put(`${BASE_URL}/api/profile`, {
          uid: user.uid,
          name, bio, location, skills, education, experience,
          linkedinId, leetcodeId, githubId, portfolioId
        });
        setProfile(res.data);  
      } catch (err) {
        console.error(err);
      }
    }
    setEditable(!editable);
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (!user?.uid) {
    return <div className="text-center mt-10">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center overflow-hidden px-4">
      <div className="w-full max-w-6xl min-h-[600px] bg-white border-4 border-gray-200 p-10 sm:p-16 md:p-20 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img
            src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg border-4 border-blue-200"
          />
          {/* Show authenticated user's email below the image */}
          {user?.email && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1 rounded-full shadow-sm mb-2 text-sm font-medium">
              <span className="text-lg">📧</span>
              {user.email}
            </div>
          )}
          {editable ? (
            <input
              type="text"
              name="name"
              value={profile.name || ''}
              onChange={handleChange}
              className="text-2xl font-semibold text-gray-800 mb-2 text-center border-b border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="Enter your name"
            />
          ) : (
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">
              {profile.name ? profile.name : <span className="text-gray-400">No name provided</span>}
            </h1>
          )}
          {editable ? (
            <textarea
              name="bio"
              value={profile.bio || ''}
              onChange={handleChange}
              className="text-gray-600 text-center mb-6 resize-none w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter your bio"
            />
          ) : (
            <p className="text-gray-600 text-center mb-6">
              {profile.bio ? profile.bio : <span className="text-gray-400">No bio provided</span>}
            </p>
          )}
        </div>

        <div className="space-y-6 mt-8">
          {[
            { key: 'location', label: 'Location', emoji: '📍', bg: 'bg-blue-50', text: 'text-blue-700' },
            { key: 'skills', label: 'Skills', emoji: '💡', bg: 'bg-blue-50', text: 'text-blue-700' },
            { key: 'education', label: 'Education', emoji: '🎓', bg: 'bg-blue-50', text: 'text-blue-700' },
            { key: 'experience', label: 'Experience', emoji: '💼', bg: 'bg-blue-50', text: 'text-blue-700' },
          ].map(({ key, label, emoji, bg, text }) => (
            <div key={key} className={`rounded-lg p-4 flex items-center gap-4 shadow-sm ${bg}`}>
              <div className={`text-2xl ${text}`}>{emoji}</div>
              <div className="flex-1">
                <h2 className={`font-semibold mb-1 ${text}`}>{label}</h2>
                {editable ? (
                  <input
                    type="text"
                    name={key}
                    value={profile[key] || ''}
                    onChange={handleChange}
                    className="w-full text-gray-700 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                    placeholder={`Enter your ${label.toLowerCase()}`}
                  />
                ) : (
                  <p className="text-gray-500">{profile[key] ? profile[key] : <span className="text-gray-400">Not provided</span>}</p>
                )}
              </div>
            </div>
          ))}

          {[
            { key: 'linkedinId', label: 'LinkedIn', emoji: '🔗', prefix: 'https://www.linkedin.com/in/', bg: 'bg-blue-50', text: 'text-blue-700' },
            { key: 'leetcodeId', label: 'Leetcode', emoji: '🧩', prefix: 'https://leetcode.com/', bg: 'bg-blue-50', text: 'text-blue-700' },
            { key: 'githubId', label: 'Github', emoji: '🐙', prefix: 'https://github.com/', bg: 'bg-blue-50', text: 'text-blue-700' },
            { key: 'portfolioId', label: 'Portfolio', emoji: '🌐', prefix: '', bg: 'bg-blue-50', text: 'text-blue-700' },
          ].map(({ key, label, emoji, prefix, bg, text }) => (
            <div key={key} className={`rounded-lg p-4 flex items-center gap-4 shadow-sm ${bg}`}>
              <div className={`text-2xl ${text}`}>{emoji}</div>
              <div className="flex-1">
                <h2 className={`font-semibold mb-1 ${text}`}>{label}</h2>
                {editable ? (
                  <input
                    type="text"
                    name={key}
                    value={profile[key] || ''}
                    onChange={handleChange}
                    className="w-full text-gray-700 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                    placeholder={label}
                  />
                ) : profile[key] ? (
                  <a
                    href={prefix ? `${prefix}${profile[key]}` : profile[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    {prefix ? `${prefix}${profile[key]}` : profile[key]}
                  </a>
                ) : (
                  <p className="text-gray-400">Not provided</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={toggleEdit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
          >
            {editable ? 'Save' : 'Edit Profile'}
          </button>
        </div>
      </div>
      
    </div>
    
  );
};

export default Profile;
