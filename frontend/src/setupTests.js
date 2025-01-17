import "@testing-library/jest-dom";

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
});
