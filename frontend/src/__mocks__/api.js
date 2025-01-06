// ✅ Define mock functions
export const getCart = jest.fn(() => Promise.resolve({ items: [] }));
export const getBicycles = jest.fn(() => Promise.resolve([]));
export const deleteBicycle = jest.fn(() => Promise.resolve());
export const createBicycle = jest.fn((bicycle) =>
  Promise.resolve({ ...bicycle, _id: "mocked-id" })
);
export const getPartOptions = jest.fn(() => Promise.resolve([]));
export const updateBicycle = jest.fn(() => Promise.resolve());
export const updateRestrictions = jest.fn(() => Promise.resolve());

// ✅ Assign object to a variable before exporting
const mockApi = {
  getCart,
  getBicycles,
  deleteBicycle,
  createBicycle,
  getPartOptions,
  updateBicycle,
  updateRestrictions,
};

export default mockApi;
