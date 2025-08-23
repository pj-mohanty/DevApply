// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Left side: Logo and navigation links */}
      <div className="flex items-center gap-6">
        <span
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate('/journal')}
        >
          DevApply
        </span>

        <Link
          to="/dashboard"
          className={`text-sm hover:text-blue-600 ${isActive('/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
        >
          Dashboard
        </Link>

        <Link
          to="/journal"
          className={`text-sm hover:text-blue-600 ${isActive('/journal') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
        >
          Journal
        </Link>

        <Link
          to="/tracker"
          className={`text-sm hover:text-blue-600 ${isActive('/applications') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
        >
          Applications
        </Link>

        <Link
          to="/resume/versions"
          className={`text-sm hover:text-blue-600 ${isActive('/resume/versions') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
        >
          Resume   
        </Link>
           {/* Add Interview History link */}
        <Link
          to="/interview-history"
          className={`text-sm hover:text-blue-600 ${isActive('/interview-history') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
        >
          🤖 Question
        </Link>
      </div>

      {/* Right side: user avatar */}
      <div className="flex items-center gap-4">
        <img
          src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740"
          alt="User Avatar"
          className="w-8 h-8 rounded-full border border-gray-300"
          onClick={() => navigate('/profile')}
        />
        {user && (
          <button
            onClick={handleLogout}
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}