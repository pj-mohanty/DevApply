// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { FirebaseError } from 'firebase/app';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ Password reset email sent. Please check your inbox.');
    } catch (err) {
      let errorMsg = 'An unexpected error occurred.';
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMsg = 'Please enter a valid email address.';
            break;
          case 'auth/user-not-found':
            errorMsg = 'No user found with this email.';
            break;
          default:
            errorMsg = err.message;
        }
      }
      setMessage(`❌ ${errorMsg}`);
      console.error(err);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-600 text-white p-3 rounded-full mb-2">
          <span className="text-xl">🔒</span>
        </div>
        <h1 className="text-3xl font-semibold">Forgot Password</h1>
        <p className="text-gray-600 mt-1">We'll send you an email to reset your password.</p>
      </div>

      <form onSubmit={handleReset} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          required
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send Reset Email
        </button>

        {message && (
          <p className={`text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>

      <p className="text-sm mt-4">
        Remembered your password?{' '}
        <Link to="/" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}