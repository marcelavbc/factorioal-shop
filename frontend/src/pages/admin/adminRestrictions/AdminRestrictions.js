import React, { useEffect, useState } from "react";
import { getPartOptions, updateRestrictions } from "../../../api/api";
import LoadingSpinner from "../../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../../components/shared/error/ErrorMessage";
import { toast } from "react-toastify";
import Select from "react-select";
import { Accordion } from "react-bootstrap";
import "./adminRestrictions.scss";
import AdminModal from "../../../components/admin/modal/AdminModal";

const AdminRestrictions = () => {
  const [partOptions, setPartOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [editingRestriction, setEditingRestriction] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [newRestriction, setNewRestriction] = useState({
    category: "",
    values: [],
  });

  const [showModal, setShowModal] = useState(false);

  const pageDescription = `
  This page allows you to manage restrictions between different bicycle part options. 
  You can set rules such as "If a bike has a Step-Through Frame, it cannot have Mountain Wheels."
  Click on a part option to view or modify its restrictions.
  `;

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
      const updatedRestrictions = {
        ...selectedOption.restrictions,
        [newRestriction.category]: newRestriction.values,
      };

      await updateRestrictions(selectedOption._id, updatedRestrictions);

      setSelectedOption((prev) => ({
        ...prev,
        restrictions: updatedRestrictions,
      }));

      setPartOptions((prev) => ({
        ...prev,
        [selectedOption.category]: prev[selectedOption.category].map((opt) =>
          opt._id === selectedOption._id
            ? { ...opt, restrictions: updatedRestrictions }
            : opt
        ),
      }));

      toast.success("Restriction updated!");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to update restrictions:", err);
      toast.error("Failed to update restrictions.");
    }
  };

  const handleRemoveRestriction = async (category) => {
    if (!selectedOption) return;

    setLoadingAction(true);

    try {
      const updatedRestrictions = { ...selectedOption.restrictions };
      delete updatedRestrictions[category];

      await updateRestrictions(selectedOption._id, updatedRestrictions);

      setSelectedOption((prev) => ({
        ...prev,
        restrictions: updatedRestrictions,
      }));

      setPartOptions((prev) => ({
        ...prev,
        [selectedOption.category]: prev[selectedOption.category].map((opt) =>
          opt._id === selectedOption._id
            ? { ...opt, restrictions: updatedRestrictions }
            : opt
        ),
      }));

      toast.success("Restriction removed!");
    } catch (err) {
      console.error("Failed to remove restriction:", err);
      toast.error("Failed to remove restriction.");
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container my-4">
      <h1>Manage Part Restrictions</h1>
      <p className="text-muted">{pageDescription}</p>

      <Accordion defaultActiveKey="0">
        {Object.entries(partOptions).map(([category, options], index) => (
          <Accordion.Item eventKey={index.toString()} key={category}>
            <Accordion.Header>{category}</Accordion.Header>
            <Accordion.Body>
              <ul className="list-group">
                {options.map((option) => (
                  <li key={option._id} className="list-group-item">
                    <button
                      className={`btn btn-light w-100 text-start ${
                        selectedOption?._id === option._id ? "active" : ""
                      }`}
                      onClick={() => handleSelectOption(option)}
                    >
                      {option.value} ({option.stock})
                    </button>
                  </li>
                ))}
              </ul>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {selectedOption && (
        <div className="restriction-form mt-4">
          <h4>Manage Restrictions for {selectedOption.value}</h4>
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
                    <div>
                      <button
                        data-testid={`edit-restriction-${selectedOption.value}`}
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleOpenModal(category, values)}
                        disabled={loadingAction}
                      >
                        {loadingAction ? "Saving..." : "Edit"}
                      </button>
                      <button
                        data-testid={`remove-restriction-${selectedOption.value}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveRestriction(category)}
                        disabled={loadingAction}
                      >
                        {loadingAction ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
          <button
            className="btn btn-primary mt-3"
            data-testid={`add-restriction-${selectedOption.value}`}
            onClick={() => handleOpenModal()}
          >
            Add Restriction
          </button>
        </div>
      )}

      <AdminModal
        show={showModal}
        title={editingRestriction ? "Edit Restriction" : "Add Restriction"}
        onSave={handleSaveRestriction}
        onHide={() => setShowModal(false)}
        isEditing={false}
      >
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Restriction Category
          </label>
          <div data-testid="categories-select">
            <Select
              id="category-select"
              inputId="category-select"
              aria-label="Restriction Category"
              data-testid="category-select"
              options={Object.keys(partOptions).map((cat) => ({
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
        </div>
        <div className="mb-3">
          <label htmlFor="values" className="form-label">
            Restricted Values
          </label>
          <div data-testid="values-select-dropdown">
            <Select
              data-testid="values-select"
              id="values-select"
              inputId="values-select"
              aria-label="Restricted Values"
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
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminRestrictions;
