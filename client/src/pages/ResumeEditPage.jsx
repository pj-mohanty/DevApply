// pages/ResumeEditPage.jsx
import { useParams } from 'react-router-dom';
import ResumeBuilder from '../components/resume/ResumeBuilder';

export default function ResumeEditPage() {
  const { tag } = useParams();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ResumeBuilder tag={tag} mode="edit" />
    </div>
  );
}