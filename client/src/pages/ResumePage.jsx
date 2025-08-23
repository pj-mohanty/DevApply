// pages/ResumePage.jsx
import ResumeBuilder from '../components/resume/ResumeBuilder';

export default function ResumePage() {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ResumeBuilder mode="create"/>
    </div>
  );
}