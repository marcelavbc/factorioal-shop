import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  getPartOptions,
  createPartOption,
  deletePartOption,
  updatePartOption,
} from "../../../api/api";
import LoadingSpinner from "../../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../../components/shared/error/ErrorMessage";
import { toast } from "react-toastify";
import "./adminParts.scss";

const AdminParts = () => {
  const [partOptions, setPartOptions] = useState({});
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

        // Group part options by category
        const groupedOptions = data.reduce((acc, option) => {
          acc[option.category] = acc[option.category] || [];
          acc[option.category].push(option);
          return acc;
        }, {});

        setPartOptions(groupedOptions);
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

      setPartOptions((prev) => ({
        ...prev,
        [addedOption.category]: [
          ...(prev[addedOption.category] || []),
          addedOption,
        ],
      }));

      setNewOption({ category: "", value: "", stock: "in_stock" });
      toast.success("Part option added successfully!");
    } catch (err) {
      console.error("Failed to add part option:", err);
      toast.error("Failed to add part option.");
    }
  };

  const handleDeleteOption = async (id, category) => {
    try {
      await deletePartOption(id);

      setPartOptions((prev) => ({
        ...prev,
        [category]: prev[category].filter((option) => option._id !== id),
      }));

      toast.success("Part option deleted successfully!");
    } catch (err) {
      console.error("Failed to delete part option:", err);
      toast.error("Failed to delete part option.");
    }
  };

  const handleToggleStock = async (id, category, currentStock) => {
    const newStockStatus =
      currentStock === "in_stock" ? "out_of_stock" : "in_stock";

    try {
      const updatedOption = await updatePartOption(id, {
        stock: newStockStatus,
      });

      setPartOptions((prev) => ({
        ...prev,
        [category]: prev[category].map((option) =>
          option._id === id ? updatedOption : option
        ),
      }));

      toast.success(
        `Stock status updated to ${updatedOption.stock.replace("_", " ")}`
      );
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error("Failed to update stock status.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container my-4">
      <h1>Manage Part Options</h1>

      {/* ✅ Add New Part Option */}
      <div className="mb-4">
        <h3>Add New Part Option</h3>
        <form onSubmit={handleAddOption}>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <Select
              inputId="category-select"
              value={
                newOption.category
                  ? { value: newOption.category, label: newOption.category }
                  : null
              }
              onChange={(selected) =>
                setNewOption((prev) => ({
                  ...prev,
                  category: selected?.value || "",
                }))
              }
              options={Object.keys(partOptions).map((category) => ({
                value: category,
                label: category,
              }))}
              isSearchable
              placeholder="Select category or type new..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Value</label>
            <input
              type="text"
              value={newOption.value}
              onChange={(e) =>
                setNewOption((prev) => ({ ...prev, value: e.target.value }))
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Stock Status</label>
            <Select
              value={{
                value: newOption.stock,
                label:
                  newOption.stock === "in_stock" ? "In Stock" : "Out of Stock",
              }}
              onChange={(selected) =>
                setNewOption((prev) => ({ ...prev, stock: selected.value }))
              }
              options={[
                { value: "in_stock", label: "In Stock" },
                { value: "out_of_stock", label: "Out of Stock" },
              ]}
              isSearchable={false}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Part Option
          </button>
        </form>
      </div>

      {/* ✅ Grouped Existing Part Options */}
      <div>
        <h3>Existing Part Options</h3>
        {Object.keys(partOptions).length === 0 ? (
          <p>No part options available.</p>
        ) : (
          Object.entries(partOptions).map(([category, options]) => (
            <div key={category} className="part-options-group">
              <h5 className="category-title">{category}</h5>
              <ul className="list-group">
                {options.map((option) => (
                  <li
                    key={option._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {option.value} ({option.stock})
                    <div className="btn-group">
                      <button
                        className={`stock-toggle-btn ${
                          option.stock === "in_stock"
                            ? "in-stock"
                            : "out-of-stock"
                        }`}
                        onClick={() =>
                          handleToggleStock(option._id, category, option.stock)
                        }
                      >
                        {option.stock === "in_stock"
                          ? "Mark as Out of Stock"
                          : "Mark as In Stock"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteOption(option._id, category)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminParts;
