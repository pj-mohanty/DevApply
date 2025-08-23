// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import InterviewPage from './pages/InterviewPage';
import JournalPage from './pages/JournalPage';
import Profile from './pages/Profile';
import Tracker from './pages/Tracker';
import ApplicationManager from './pages/ApplicationManager';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import SignupPage from './pages/SignupPage';
import EntrySaveSuccessPage from './pages/EntrySaveSuccessPage';
import InterviewEntryViewPage from './pages/InterviewEntryViewPage';
import InterviewEntryEditPage from './pages/InterviewEntryEditPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResumePage from './pages/ResumePage';
import { AuthProvider } from './context/AuthContext';
import ResumeVersionsPage from './pages/ResumeVersionsPage';
import ResumeViewPage from './pages/ResumeViewPage';
import ResumeEditPage from './pages/ResumeEditPage';
import AIInterviewPage from './pages/AIInterviewPage';
import QuestionHistoryPage from './pages/QuestionHistoryPage'; 

import 'prismjs/themes/prism.css';



function Layout({ children }) {
  const location = useLocation();
  // Add paths where you do NOT want the navbar:
  const hideNavbarPaths = ['/', '/signup', '/forgot-password'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>  {/* Wrap the app with AuthProvider */}
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/entry-success" element={<EntrySaveSuccessPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/interview/:id" element={<InterviewEntryViewPage />} />
            <Route path="/interview/:id/edit" element={<InterviewEntryEditPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/applicationmanager" element={<ApplicationManager />} />
            <Route path="/mock-interview" element={<AIInterviewPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/resume/versions" element={<ResumeVersionsPage />} />
            <Route path="/resume/view/:tag" element={<ResumeViewPage />} />
            <Route path="/resume/edit/:tag" element={<ResumeEditPage />} />
            <Route path="/interview-history" element={<QuestionHistoryPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;