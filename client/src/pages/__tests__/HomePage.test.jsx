// client/src/pages/_tests_/HomePage.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';

// Mock Firebase auth methods
jest.mock('../../firebase', () => ({
  auth: {},
  googleProvider: {}
}));

import * as firebaseAuth from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  fetchSignInMethodsForEmail: jest.fn(() => Promise.resolve([])),
  signInWithPopup: jest.fn(() =>
    Promise.resolve({ _tokenResponse: { isNewUser: false }, user: { delete: jest.fn() } })
  ),
  linkWithCredential: jest.fn(() => Promise.resolve())
}));

describe('HomePage', () => {
  test('renders login form and allows typing', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

    // Simulate typing
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' }
    });

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('password123')).toBeInTheDocument();
  });

  test('clicks google login button and handles login success', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const googleButton = screen.getByRole('button', { name: /continue with google/i });
    expect(googleButton).toBeInTheDocument();

    // Use act and await to handle async state updates
    await act(async () => {
      fireEvent.click(googleButton);
    });

    // Optionally, assert expected side effects like no error message or presence of user info
    // For example, if you show a welcome message after login, check for it here
    // await waitFor(() => expect(screen.queryByText(/error/i)).not.toBeInTheDocument());
  });

  test('clicks google login button and handles login failure', async () => {
    // Override signInWithPopup to reject and test error handling
    firebaseAuth.signInWithPopup.mockImplementationOnce(() =>
      Promise.reject(new Error('Mock Google login error'))
    );

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const googleButton = screen.getByRole('button', { name: /continue with google/i });
    expect(googleButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(googleButton);
    });

    // Check if error message is shown after rejection
    await waitFor(() =>
      expect(screen.getByText(/unexpected error during google login/i)).toBeInTheDocument()
    );
  });
});
