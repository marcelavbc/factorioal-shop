import React, { useEffect, useState } from "react";
import { getPartOptions, updateAllowedParts } from "../../../api/api";
import LoadingSpinner from "../../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../../components/shared/error/ErrorMessage";
import { toast } from "react-toastify";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap"; // ✅ Import Bootstrap Modal

const AdminRestrictions = () => {
  const [partOptions, setPartOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [editingRestriction, setEditingRestriction] = useState(null);
  const [newRestriction, setNewRestriction] = useState({
    category: "",
    values: [],
  });

  const [showModal, setShowModal] = useState(false); // ✅ Modal Visibility State

  // 🔄 Fetch Data & Auto-Refresh on Changes
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

  // 🆕 Auto-Refresh Selected Part on Update
  useEffect(() => {
    if (selectedOption) {
      setSelectedOption((prev) => {
        if (!prev) return null;
        return (
          partOptions[prev.category]?.find((opt) => opt._id === prev._id) ||
          prev
        );
      });
    }
  }, [partOptions]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setEditingRestriction(null);
    setNewRestriction({ category: "", values: [] });
  };

  const handleOpenModal = (category = "", values = []) => {
    setEditingRestriction(category || null);
    setNewRestriction({ category, values });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveRestriction = async () => {
    if (
      !selectedOption ||
      !newRestriction.category ||
      newRestriction.values.length === 0
    ) {
      toast.error("Please select a valid category and values.");
      return;
    }

    try {
      const updatedAllowedParts = {
        ...selectedOption.allowedParts,
        [newRestriction.category]: newRestriction.values,
      };

      await updateAllowedParts(selectedOption._id, updatedAllowedParts); // ✅ API Call

      // 🔄 Update UI without refresh
      setPartOptions((prev) => ({
        ...prev,
        [selectedOption.category]: prev[selectedOption.category].map((opt) =>
          opt._id === selectedOption._id
            ? { ...opt, allowedParts: updatedAllowedParts } // ✅ Fix UI update
            : opt
        ),
      }));

      toast.success(
        editingRestriction ? "Allowed Parts updated!" : "Allowed Parts added!"
      );
      setShowModal(false);
    } catch (err) {
      console.error("Failed to update allowed parts:", err);
      toast.error("Failed to update allowed parts.");
    }
  };

  const handleRemoveRestriction = async (category) => {
    if (!selectedOption) return;

    try {
      const updatedAllowedParts = { ...selectedOption.allowedParts };
      delete updatedAllowedParts[category];

      await updateAllowedParts(selectedOption._id, updatedAllowedParts);

      // 🔄 Update UI without Refresh
      setPartOptions((prev) => ({
        ...prev,
        [selectedOption.category]: prev[selectedOption.category].map((opt) =>
          opt._id === selectedOption._id
            ? { ...opt, restrictions: updatedAllowedParts }
            : opt
        ),
      }));

      toast.success("Restriction removed!");
    } catch (err) {
      console.error("Failed to remove restriction:", err);
      toast.error("Failed to remove restriction.");
    }
  };

  // 🛑 **Prevent Adding Duplicate Restrictions**
  const availableCategories = Object.keys(partOptions).filter(
    (category) => !selectedOption?.restrictions?.[category]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container my-4">
      <h1>Manage Part Option Restrictions</h1>

      <div className="mb-4">
        <h3>Select Part Option</h3>
        {Object.entries(partOptions).map(([category, options]) => (
          <div key={category} className="part-options-group">
            <h5 className="category-title">{category}</h5>
            <ul className="list-group">
              {options.map((option) => (
                <li
                  key={option._id}
                  className={`list-group-item ${
                    selectedOption?._id === option._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectOption(option)}
                  style={{ cursor: "pointer" }}
                >
                  {option.value} ({option.stock})
                </li>
              ))}
            </ul>

            {selectedOption && selectedOption.category === category && (
              <div className="restriction-form">
                <h4>Manage Restrictions for {selectedOption.value}</h4>
                {Object.entries(selectedOption.restrictions || {}).length ===
                0 ? (
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
                          <div>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleOpenModal(category, values)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveRestriction(category)}
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                )}

                <button
                  className="btn btn-primary mt-3"
                  onClick={() => handleOpenModal()}
                >
                  Add Restriction
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 Bootstrap Modal for Add/Edit Restriction */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRestriction ? "Edit Restriction" : "Add Restriction"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Restriction Category</label>
            <Select
              options={availableCategories.map((cat) => ({
                value: cat,
                label: cat,
              }))}
              onChange={(selected) =>
                setNewRestriction((prev) => ({
                  ...prev,
                  category: selected.value,
                }))
              }
              value={
                newRestriction.category
                  ? {
                      value: newRestriction.category,
                      label: newRestriction.category,
                    }
                  : null
              }
              isDisabled={editingRestriction}
              placeholder="Select Category"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Restricted Values</label>
            <Select
              options={(partOptions[newRestriction.category] || []).map(
                (opt) => ({ value: opt.value, label: opt.value })
              )}
              isMulti
              onChange={(selected) =>
                setNewRestriction((prev) => ({
                  ...prev,
                  values: selected.map((s) => s.value),
                }))
              }
              value={newRestriction.values.map((v) => ({ value: v, label: v }))}
              placeholder="Select Restricted Values"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveRestriction}>
            {editingRestriction ? "Update Restriction" : "Add Restriction"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminRestrictions;
