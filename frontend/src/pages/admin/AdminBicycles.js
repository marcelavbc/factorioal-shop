import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getBicycles,
  deleteBicycle,
  createBicycle,
  getPartOptions,
} from "../../api/api";
import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";

const AdminBicycles = () => {
  const [bicycles, setBicycles] = useState([]);
  const [partOptions, setPartOptions] = useState([]); // Available part options
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBicycle, setNewBicycle] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    partOptions: [], // Selected part options
  });

  // Fetch bicycles and part options
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bicycleData, partOptionData] = await Promise.all([
          getBicycles(),
          getPartOptions(),
        ]);
        setBicycles(bicycleData);
        setPartOptions(partOptionData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteBicycle(id);
      toast.success("Bicycle deleted!");
      setBicycles((prev) => prev.filter((bike) => bike._id !== id));
    } catch (err) {
      console.error("Failed to delete bicycle:", err);
      toast.error("Failed to delete bicycle.");
    }
  };

  const handleCreate = async () => {
    if (!newBicycle.name || !newBicycle.description || !newBicycle.price) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const createdBicycle = await createBicycle(newBicycle);
      toast.success("Bicycle created!");
      setBicycles((prev) => [...prev, createdBicycle]);
      setNewBicycle({
        name: "",
        description: "",
        price: "",
        image: "",
        partOptions: [],
      });
    } catch (err) {
      console.error("Failed to create bicycle:", err);
      toast.error("Failed to create bicycle.");
    }
  };

  const handlePartOptionChange = (e) => {
    const optionId = e.target.value;
    setNewBicycle((prev) => ({
      ...prev,
      partOptions: e.target.checked
        ? [...prev.partOptions, optionId]
        : prev.partOptions.filter((id) => id !== optionId),
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container my-4">
      <h1>Manage Bicycles</h1>

      {/* List of Bicycles */}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bicycles.map((bike) => (
            <tr key={bike._id}>
              <td>{bike.name}</td>
              <td>{bike.description}</td>
              <td>${bike.price}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(bike._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add New Bicycle */}
      <h2>Add New Bicycle</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={newBicycle.name}
            onChange={(e) =>
              setNewBicycle((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className="form-control"
            value={newBicycle.description}
            onChange={(e) =>
              setNewBicycle((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Price
          </label>
          <input
            type="number"
            id="price"
            className="form-control"
            value={newBicycle.price}
            onChange={(e) =>
              setNewBicycle((prev) => ({ ...prev, price: e.target.value }))
            }
          />
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">
            Image URL
          </label>
          <input
            type="text"
            id="image"
            className="form-control"
            value={newBicycle.image}
            onChange={(e) =>
              setNewBicycle((prev) => ({ ...prev, image: e.target.value }))
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Part Options</label>
          {partOptions.map((option) => (
            <div key={option._id} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                value={option._id}
                onChange={handlePartOptionChange}
              />
              <label className="form-check-label">
                {option.category}: {option.value}
              </label>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary">
          Add Bicycle
        </button>
      </form>
    </div>
  );
};

export default AdminBicycles;
