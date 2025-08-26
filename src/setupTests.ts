import '@testing-library/jest-dom';
// Silence noisy console.log from file system utils during tests
const originalLog = console.log;
beforeAll(() => {
  console.log = () => {};
});
afterAll(() => {
  console.log = originalLog;
});


