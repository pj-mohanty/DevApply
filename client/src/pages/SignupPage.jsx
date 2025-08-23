// src/pages/SignupPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { FirebaseError } from 'firebase/app';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState(null); // 'signup-success', 'exists'
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignupEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setAccountStatus(null);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        setAccountStatus('exists');
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);
      setAccountStatus('signup-success');
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setAccountStatus('exists');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/weak-password':
            setError('Password should be at least 6 characters.');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('An unexpected error occurred.');
        console.error(err);
      }
    }
  };

  const handleSignupGoogle = async () => {
    setError(null);
    setAccountStatus(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = result?._tokenResponse?.isNewUser;
      if (isNewUser) {
        setAccountStatus('signup-success');
      } else {
        setAccountStatus('exists');
        await auth.signOut();
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/account-exists-with-different-credential') {
          setAccountStatus('exists');
        } else if (err.code === 'auth/popup-closed-by-user') {
          setError('Google sign-in popup was closed. Please try again.');
        } else {
          setError(`Failed to sign in with Google: ${err.message}`);
        }
      } else {
        setError('An unexpected error occurred during Google sign-in.');
        console.error(err);
      }
    }
  };

  const handleGoToLogin = () => {
    navigate('/dashboard');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-600 text-white p-3 rounded-full mb-2">
          <span className="text-xl">📦</span>
        </div>
        <h1 className="text-3xl font-semibold">DevApply</h1>
        <p className="text-gray-600 mt-1">Create an account to track your job hunt</p>
      </div>

      {/* Success message for first time signup */}
      {accountStatus === 'signup-success' && (
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md space-y-4 mb-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Successfully Signed Up!</h3>
            <p className="text-sm text-gray-500 mt-1">You're now registered.</p>
          </div>
          <button
            onClick={handleGoToLogin}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Login
          </button>
        </div>
      )}

      {/* Account already exists */}
      {accountStatus === 'exists' && (
        <div className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4 mb-4">
          <p className="text-red-600">An account already exists with this email or Google account.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Go back to homepage
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4 mb-4">
          <p className="text-red-600">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setError(null); setAccountStatus(null); }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {/* Signup form */}
      {!accountStatus && !error && (
        <form onSubmit={handleSignupEmail} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
          <button
            type="button"
            onClick={handleSignupGoogle}
            className="w-full flex items-center justify-center border border-gray-300 rounded py-2 hover:bg-gray-50"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="w-5 h-5 mr-2" />
            Sign up with Google
          </button>
          <div className="flex items-center justify-between">
            <span className="flex-1 border-t border-gray-300"></span>
            <span className="px-2 text-gray-400 text-sm">or</span>
            <span className="flex-1 border-t border-gray-300"></span>
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Create a password"
            required
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Sign up
          </button>
        </form>
      )}

      <p className="text-sm mt-4">
        Already have an account?{' '}
        <Link to="/" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}