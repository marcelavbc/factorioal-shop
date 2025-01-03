import React, { useEffect, useState } from "react";
import {
  getPartOptions,
  createPartOption,
  deletePartOption,
} from "../../api/api";
import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";
import { toast } from "react-toastify";

const AdminParts = () => {
  const [partOptions, setPartOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOption, setNewOption] = useState({
    category: "",
    value: "",
    stock: "in_stock",
  });

  useEffect(() => {
    const fetchPartOptions = async () => {
      try {
        const data = await getPartOptions();
        setPartOptions(data);
      } catch (err) {
        console.error("Failed to fetch part options:", err);
        setError("Failed to load part options.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartOptions();
  }, []);

  const handleAddOption = async (e) => {
    e.preventDefault();
    try {
      const addedOption = await createPartOption(newOption);
      setPartOptions((prev) => [...prev, addedOption]);
      setNewOption({ category: "", value: "", stock: "in_stock" }); // Reset form
      toast.success("Part option added successfully!");
    } catch (err) {
      console.error("Failed to add part option:", err);
      toast.error("Failed to add part option.");
    }
  };

  const handleDeleteOption = async (id) => {
    try {
      await deletePartOption(id);
      setPartOptions((prev) => prev.filter((option) => option._id !== id));
      toast.success("Part option deleted successfully!");
    } catch (err) {
      console.error("Failed to delete part option:", err);
      toast.error("Failed to delete part option.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container my-4">
      <h1>Manage Part Options</h1>

      <div className="mb-4">
        <h3>Add New Part Option</h3>
        <form onSubmit={handleAddOption}>
          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={newOption.category}
              onChange={(e) =>
                setNewOption((prev) => ({ ...prev, category: e.target.value }))
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="value" className="form-label">
              Value
            </label>
            <input
              type="text"
              id="value"
              value={newOption.value}
              onChange={(e) =>
                setNewOption((prev) => ({ ...prev, value: e.target.value }))
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="stock" className="form-label">
              Stock Status
            </label>
            <select
              id="stock"
              value={newOption.stock}
              onChange={(e) =>
                setNewOption((prev) => ({ ...prev, stock: e.target.value }))
              }
              className="form-select"
              required
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Part Option
          </button>
        </form>
      </div>

      <div>
        <h3>Existing Part Options</h3>
        {partOptions.length === 0 ? (
          <p>No part options available.</p>
        ) : (
          <ul className="list-group">
            {partOptions.map((option) => (
              <li
                key={option._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {option.category} - {option.value} ({option.stock})
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteOption(option._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminParts;
