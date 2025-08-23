import '@testing-library/jest-dom';

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn((...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      if (message.includes('Error fetching dashboard data:') ||
          message.includes('Error: Mock Google login error') ||
          message.includes('Error: Not implemented: window.alert') ||
          message.includes('Warning: An update to') ||
          message.includes('When testing, code that causes React state updates')) {
        return;
      }
    }
    originalError(...args);
  });
  console.warn = jest.fn((...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('Warning: An update to') ||
         message.includes('When testing, code that causes React state updates'))) {
      return;
    }
    originalWarn(...args);
  });
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    }))
  }
}));
