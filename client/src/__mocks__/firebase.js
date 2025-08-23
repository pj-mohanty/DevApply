// __mocks__/firebase.mock.js
export const auth = {
  currentUser: {
    uid: 'mock-uid',
    email: 'mock@example.com',
  },
};

export const fetchSignInMethodsForEmail = jest.fn(() => Promise.resolve(['password']));
export const sendPasswordResetEmail = jest.fn(() => Promise.resolve('mock-success'));

export class FirebaseError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'FirebaseError';
  }
}

