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
import { Button } from "react-bootstrap";
import "./adminParts.scss";
import AdminModal from "../../../components/admin/modal/AdminModal";

const AdminParts = () => {
  const [partOptions, setPartOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newOption, setNewOption] = useState({
    value: "",
    stock: "in_stock",
  });

  useEffect(() => {
    const fetchPartOptions = async () => {
      try {
        const data = await getPartOptions();

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

    const { value, stock } = newOption;

    if (!value.trim()) {
      toast.error("Please enter a valid value.");
      return;
    }

    if (
      partOptions[selectedCategory]?.some(
        (option) => option.value.toLowerCase() === value.toLowerCase()
      )
    ) {
      toast.error(
        `"${value}" already exists in ${selectedCategory}. Choose a different value.`
      );
      return;
    }

    try {
      // ✅ Include `value` field in the request
      const addedOption = await createPartOption({
        category: selectedCategory,
        value, // Fix: Ensure value is included
        stock,
      });

      setPartOptions((prev) => ({
        ...prev,
        [addedOption.category]: [
          ...(prev[addedOption.category] || []),
          addedOption,
        ],
      }));

      setNewOption({ value: "", stock: "in_stock" });
      setShowModal(false);
      toast.success(`Added "${addedOption.value}" to ${selectedCategory}!`);
    } catch (err) {
      console.error("Failed to add part option:", err);
      toast.error("Failed to add part option.");
    }
  };

  const handleDeleteOption = async (id, category) => {
    try {
      await deletePartOption(id);

      setPartOptions((prev) => {
        if (!prev[category]) return prev; // 🛑 Ensure category exists

        const updatedOptions = prev[category].filter(
          (option) => option._id !== id
        );

        return {
          ...prev,
          [category]: updatedOptions.length > 0 ? updatedOptions : undefined, // Remove category if empty
        };
      });

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
      <div>
        <h3>Existing Part Options</h3>
        {Object.keys(partOptions).length === 0 ? (
          <p>No part options available.</p>
        ) : (
          Object.entries(partOptions).map(([category, options]) => (
            <div key={category} className="part-options-group">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="category-title">{category}</h5>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowModal(true);
                  }}
                >
                  + Add {category}
                </button>
              </div>
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
                        data-testid={`toggle-stock-${option._id}`}
                        onClick={() =>
                          handleToggleStock(option._id, category, option.stock)
                        }
                      >
                        {option.stock === "in_stock"
                          ? "Mark as Out of Stock"
                          : "Mark as In Stock"}
                      </button>
                      <button
                        data-testid={`delete-${option._id}`}
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
      <AdminModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={`Add New ${selectedCategory}`}
        onSave={handleAddOption}
        isEditing={false}
      >
        <form onSubmit={handleAddOption}>
          <div className="mb-3">
            <label htmlFor="value" className="form-label">
              Value
            </label>
            <input
              id="value"
              type="text"
              value={newOption.value || ""}
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="ms-2">
            Add {selectedCategory}
          </Button>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminParts;
