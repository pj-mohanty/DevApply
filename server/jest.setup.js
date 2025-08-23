const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  
  console.error = jest.fn((...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('Error updating application:') ||
         message.includes('Error deleting application:') ||
         message.includes('Error fetching dashboard stats:'))) {
      return;
    }
    originalError(...args);
  });
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
}); 
