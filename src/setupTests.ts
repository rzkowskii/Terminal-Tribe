// Silence noisy console.log from file system utils during tests
const originalLog = console.log;
beforeAll(() => {
  console.log = (..._args: unknown[]) => {};
});
afterAll(() => {
  console.log = originalLog;
});


