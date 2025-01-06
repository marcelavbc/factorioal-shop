import "@testing-library/jest-dom";

// ✅ Mock LocalStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// ✅ Auto-mock API Calls
jest.mock("./api/api");

// ✅ Auto-mock useCart Context
jest.mock("./context/CartContext");

// ✅ Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
