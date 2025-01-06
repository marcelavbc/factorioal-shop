const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => (store[key] = value.toString())),
    removeItem: jest.fn((key) => delete store[key]),
    clear: jest.fn(() => (store = {})),
  };
})();

Object.defineProperty(global, "localStorage", { value: mockLocalStorage });

export default mockLocalStorage;
