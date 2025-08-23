//client/src/pages/__tests__/SignupPage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SignupPage from '../SignupPage';

jest.mock('../../firebase', () => ({
  auth: { signOut: jest.fn() },
  googleProvider: {},
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signInWithPopup: jest.fn(() =>
    Promise.resolve({
      _tokenResponse: {},  // Add this empty object here to avoid the error
      user: {}
    })
  ),
  fetchSignInMethodsForEmail: jest.fn(() => Promise.resolve([]))
}));


describe('SignupPage', () => {
  test('renders signup form and allows typing', async () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    await userEvent.type(emailInput, 'new@example.com');
    await userEvent.type(passwordInput, 'securepass');

    expect(screen.getByDisplayValue('new@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('securepass')).toBeInTheDocument();
  });

  test('clicks sign up with google', async () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    const googleButton = screen.getByRole('button', { name: /sign up with google/i });
    expect(googleButton).toBeInTheDocument();

    await userEvent.click(googleButton);
  });
});
