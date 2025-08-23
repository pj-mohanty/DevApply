// src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithPopup,
  linkWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { FirebaseError } from 'firebase/app';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState(null); // null, 'exists-google', 'new-google'
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loginEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setAccountStatus(null);
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/invalid-email') {
          setError('Invalid email address.');
          return;
        }
        if (err.code === 'auth/user-disabled') {
          setError('This account has been disabled.');
          return;
        }
        
        if (
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential'
        ) {
          // Here: check sign-in methods
          try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.length === 0) {
              // No user at all
              setError('No user found with this email.');
            } else if (methods.includes('google.com')) {
              // User signed up only with Google, no password
              setAccountStatus('exists-google');
            } else {
              // User has password, so show wrong password or user not found
              setError(err.code === 'auth/wrong-password' ? 'Incorrect password.' : 'No user found with this email.');
            }
          } catch (fetchErr) {
            console.error('Error fetching sign-in methods:', fetchErr);
            setError('An error occurred while checking account methods.');
          }
          return;
        }
        
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
        console.error('Login error:', err);
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    setAccountStatus(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = result?._tokenResponse?.isNewUser;
      if (isNewUser) {
        // delete the just-created user to block them
        await result.user.delete();
        setAccountStatus('new-google');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/account-exists-with-different-credential': {
            const email = err.customData?.email;
            const pendingCred = googleProvider.credentialFromError(err);
            const password = prompt(`You previously signed up using email/password for ${email}. Enter password to link Google:`);
            if (password) {
              try {
                const userCred = await signInWithEmailAndPassword(auth, email, password);
                await linkWithCredential(userCred.user, pendingCred);
                alert('Accounts linked successfully.');
                navigate('/dashboard');
              } catch (linkErr) {
                setError('Failed to link accounts. Please check your password.');
                console.error(linkErr);
              }
            }
            break;
          }
          case 'auth/popup-closed-by-user':
            setError('You closed the sign-in popup.');
            break;
          case 'auth/network-request-failed':
            setError('Network error. Check your connection.');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('Unexpected error during Google login.');
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-600 text-white p-3 rounded-full mb-2">
          <span className="text-xl">📦</span>
        </div>
        <h1 className="text-3xl font-semibold">DevApply</h1>
        <p className="text-gray-600 mt-1">Track your job hunt. Log your interviews. Level up.</p>
      </div>

      {/* Existing Google account → prompt to login with Google */}
      {accountStatus === 'exists-google' && (
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md space-y-4 mb-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l8-8m0 0l-8-8m8 8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">This account is registered with Google</h3>
            <p className="text-sm text-gray-500 mt-1">Please sign in with Google to continue.</p>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Login with Google
          </button>
          <button
            onClick={() => {
              setAccountStatus(null);
              setError(null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Try another account
          </button>
        </div>
      )}

      {/* New Google user → prompt to go to signup */}
      {accountStatus === 'new-google' && (
        <div className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4 mb-4">
          <p className="text-gray-800">It looks like you haven’t signed up yet. Please sign up first to use Google login.</p>
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Go to Signup
          </button>
          <button
            onClick={() => setAccountStatus(null)}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      )}

      {/* Show other errors */}
      {error && (
        <div className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4 mb-4">
          <p className="text-red-600">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setError(null);
                setAccountStatus(null);
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Default login form */}
      {!accountStatus && !error && (
        <form onSubmit={loginEmail} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 rounded py-2 hover:bg-gray-50"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
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
            placeholder="Enter your password"
            required
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
      )}

      <p className="text-sm mt-4">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}