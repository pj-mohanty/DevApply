/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
  "/node_modules/(?!(react-markdown|rehype-highlight|remark-gfm)/)"
],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['./src/setupTests.js'],
  verbose: true,
};

