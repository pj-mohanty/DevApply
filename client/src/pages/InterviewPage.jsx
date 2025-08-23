import InterviewEntryForm from '../components/InterviewEntryForm';

export default function InterviewPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Shared Container for Header + Form */}
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 px-6">
          <h1 className="text-3xl font-bold text-gray-800">DevApply</h1>
          <h2 className="text-base text-gray-500 mt-1">Interview Journal Entry</h2>
          <p className="text-sm text-gray-400 mt-1">
            Log your interview questions and responses to track your progress
          </p>
        </header>

        {/* Form Section */}
        <InterviewEntryForm />
      </div>
    </main>
  );
}