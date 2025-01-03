import React, { useEffect, useState } from "react";
import { getPartOptions, updateRestrictions } from "../../api/api";
import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";
import { toast } from "react-toastify";

const AdminRestrictions = () => {
  const [partOptions, setPartOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [newRestriction, setNewRestriction] = useState({
    category: "",
    values: [],
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

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setNewRestriction({ category: "", values: [] });
  };

  const handleAddRestriction = async () => {
    if (
      !selectedOption ||
      !newRestriction.category ||
      newRestriction.values.length === 0
    ) {
      toast.error(
        "Please select a part option and add valid restriction values."
      );
      return;
    }

    try {
      const updatedRestrictions = {
        ...selectedOption.restrictions,
        [newRestriction.category]: newRestriction.values,
      };

      await updateRestrictions(selectedOption._id, updatedRestrictions);
      setPartOptions((prev) =>
        prev.map((opt) =>
          opt._id === selectedOption._id
            ? { ...opt, restrictions: updatedRestrictions }
            : opt
        )
      );

      toast.success("Restriction added successfully!");
      setNewRestriction({ category: "", values: [] });
    } catch (err) {
      console.error("Failed to add restriction:", err);
      toast.error("Failed to add restriction.");
    }
  };

  const handleRemoveRestriction = async (category) => {
    if (!selectedOption) return;

    try {
      const updatedRestrictions = { ...selectedOption.restrictions };
      delete updatedRestrictions[category];

      await updateRestrictions(selectedOption._id, updatedRestrictions);
      setPartOptions((prev) =>
        prev.map((opt) =>
          opt._id === selectedOption._id
            ? { ...opt, restrictions: updatedRestrictions }
            : opt
        )
      );

      toast.success("Restriction removed successfully!");
    } catch (err) {
      console.error("Failed to remove restriction:", err);
      toast.error("Failed to remove restriction.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container my-4">
      <h1>Manage Part Option Restrictions</h1>

      {/* 🔹 Explanation Box */}
      <div className="alert alert-info">
        <h4>How to Use This Page</h4>
        <p>
          Restrictions prevent users from selecting incompatible bicycle parts.
          For example:
        </p>
        <ul>
          <li>
            If <strong>Mountain Wheels</strong> are selected, only{" "}
            <strong>Full Suspension</strong> frames are allowed.
          </li>
          <li>
            If <strong>Fat Bike Wheels</strong> are selected, the{" "}
            <strong>Red Rim Color</strong> may not be available.
          </li>
        </ul>
        <p>
          <strong>To Add a Restriction:</strong>
        </p>
        <ol>
          <li>Select a part option from the list below.</li>
          <li>
            Enter the category (e.g., "Frame Type") that should be restricted.
          </li>
          <li>Enter the allowed values for that category.</li>
          <li>Click "Add Restriction".</li>
        </ol>
        <p>
          <strong>To Remove a Restriction:</strong>
        </p>
        <ol>
          <li>Select a part option from the list below.</li>
          <li>Click the "Remove" button next to an existing restriction.</li>
        </ol>
      </div>

      <div className="mb-4">
        <h3>Select Part Option</h3>
        <ul className="list-group">
          {partOptions.map((option) => (
            <li
              key={option._id}
              className={`list-group-item ${
                selectedOption?._id === option._id ? "active" : ""
              }`}
              onClick={() => handleSelectOption(option)}
              style={{ cursor: "pointer" }}
            >
              {option.category} - {option.value} ({option.stock})
            </li>
          ))}
        </ul>
      </div>

      {selectedOption && (
        <div>
          <h3>Current Restrictions for {selectedOption.value}</h3>
          {Object.entries(selectedOption.restrictions || {}).length === 0 ? (
            <p>No restrictions set.</p>
          ) : (
            <ul className="list-group">
              {Object.entries(selectedOption.restrictions).map(
                ([category, values]) => (
                  <li
                    key={category}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>
                      <strong>{category}</strong>: {values.join(", ")}
                    </span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveRestriction(category)}
                    >
                      Remove
                    </button>
                  </li>
                )
              )}
            </ul>
          )}

          <h3 className="mt-4">Add New Restriction</h3>
          <div className="mb-3">
            <label htmlFor="restrictionCategory" className="form-label">
              Restriction Category
            </label>
            <input
              type="text"
              id="restrictionCategory"
              value={newRestriction.category}
              onChange={(e) =>
                setNewRestriction((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="restrictionValues" className="form-label">
              Allowed Values (comma separated)
            </label>
            <input
              type="text"
              id="restrictionValues"
              value={newRestriction.values.join(", ")}
              onChange={(e) =>
                setNewRestriction((prev) => ({
                  ...prev,
                  values: e.target.value.split(",").map((v) => v.trim()),
                }))
              }
              className="form-control"
              required
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddRestriction}>
            Add Restriction
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRestrictions;
