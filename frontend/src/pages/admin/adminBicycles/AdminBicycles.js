import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getBicycles,
  deleteBicycle,
  createBicycle,
  getPartOptions,
  updateBicycle,
} from "../../../api/api";
import LoadingSpinner from "../../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../../components/shared/error/ErrorMessage";
import { Modal, Button } from "react-bootstrap";
import "./adminBicycles.scss";

const AdminBicycles = () => {
  const [bicycles, setBicycles] = useState([]);
  const [partOptions, setPartOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedOptions, setCheckedOptions] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBicycleId, setEditingBicycleId] = useState(null);
  const [originalBicycle, setOriginalBicycle] = useState(null);

  const [bicycleForm, setBicycleForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    partOptions: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bicycleData, partOptionData] = await Promise.all([
          getBicycles(),
          getPartOptions(),
        ]);

        setBicycles(bicycleData);
        setPartOptions(groupPartOptions(partOptionData));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupPartOptions = (options) => {
    return options.reduce((acc, option) => {
      acc[option.category] = acc[option.category] || [];
      acc[option.category].push(option);
      return acc;
    }, {});
  };

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

  const handleSaveBicycle = async () => {
    if (!bicycleForm.name || !bicycleForm.description || !bicycleForm.price) {
      toast.error("All fields are required!");
      return;
    }

    const formattedBicycle = {
      ...bicycleForm,
      price: parseFloat(bicycleForm.price),
    };

    if (formattedBicycle.price <= 0 || isNaN(formattedBicycle.price)) {
      toast.error("Price must be a valid number greater than zero!");
      return;
    }

    const missingOptions = Object.keys(partOptions).filter(
      (category) =>
        !partOptions[category].some((option) =>
          bicycleForm.partOptions.includes(option._id)
        )
    );

    if (missingOptions.length > 0) {
      toast.error(
        `Please select at least one option for: ${missingOptions.join(", ")}`
      );
      return;
    }

    //Dynamically update partOptions based on user modifications
    let updatedPartOptions = [...originalBicycle.partOptions];

    // Remove unchecked options
    updatedPartOptions = updatedPartOptions.filter(
      (opt) => checkedOptions[opt]
    );

    // Add newly selected options
    bicycleForm.partOptions.forEach((opt) => {
      if (!updatedPartOptions.includes(opt)) {
        updatedPartOptions.push(opt);
      }
    });

    formattedBicycle.partOptions = updatedPartOptions;

    try {
      if (isEditing) {
        await updateBicycle(editingBicycleId, formattedBicycle);
        toast.success("Bicycle updated!");
        setBicycles((prev) =>
          prev.map((bike) =>
            bike._id === editingBicycleId
              ? { ...bike, ...formattedBicycle }
              : bike
          )
        );
      } else {
        const createdBicycle = await createBicycle(formattedBicycle);
        toast.success("Bicycle created!");
        setBicycles((prev) => [...prev, createdBicycle]);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save bicycle:", err);
      toast.error("Failed to save bicycle.");
    }
  };

  const handleEdit = (bicycle) => {
    setBicycleForm({
      name: bicycle.name,
      description: bicycle.description,
      price: bicycle.price,
      image: bicycle.image || "",
      partOptions: [...bicycle.partOptions],
    });

    setCheckedOptions(
      bicycle.partOptions.reduce((acc, opt) => {
        acc[opt] = true;
        return acc;
      }, {})
    );

    setIsEditing(true);
    setEditingBicycleId(bicycle._id);
    setOriginalBicycle(bicycle);
    setShowModal(true);
  };

  const resetForm = () => {
    setBicycleForm({
      name: "",
      description: "",
      price: "",
      image: "",
      partOptions: [],
    });
    setCheckedOptions({});
    setIsEditing(false);
    setEditingBicycleId(null);
    setOriginalBicycle(null);
  };

  const handlePartOptionChange = (e) => {
    const optionId = e.target.value;
    const isChecked = e.target.checked;

    setBicycleForm((prev) => {
      let updatedOptions = [...prev.partOptions];

      if (isChecked) {
        if (!updatedOptions.includes(optionId)) {
          updatedOptions.push(optionId);
        }
      } else {
        updatedOptions = updatedOptions.filter((id) => id !== optionId);
      }

      return { ...prev, partOptions: updatedOptions };
    });

    setCheckedOptions((prev) => ({
      ...prev,
      [optionId]: isChecked,
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container my-4">
      <h1>Manage Bicycles</h1>

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
                  className="btn btn-warning me-2"
                  onClick={() => handleEdit(bike)}
                >
                  Edit
                </button>
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

      <button
        className="btn btn-primary mt-4"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        Add New Bicycle
      </button>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName="custom-modal-size"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Bicycle" : "Add New Bicycle"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              value={bicycleForm.name}
              onChange={(e) =>
                setBicycleForm({ ...bicycleForm, name: e.target.value })
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
              value={bicycleForm.description}
              onChange={(e) =>
                setBicycleForm((prev) => ({
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
              value={bicycleForm.price}
              onChange={(e) =>
                setBicycleForm((prev) => ({ ...prev, price: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Image
            </label>
            <input
              type="text"
              id="image"
              className="form-control"
              value={bicycleForm.image}
              onChange={(e) =>
                setBicycleForm((prev) => ({ ...prev, image: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <h4 className="form-label">Part Options</h4>
            <div className="part-options-container">
              {Object.entries(partOptions).map(([category, options]) => (
                <div key={category} className="part-options-group">
                  <h5>{category}</h5>
                  <div className="checkbox-grid">
                    {options.map((option) => (
                      <div key={option._id} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          value={option._id}
                          checked={
                            checkedOptions[option._id] !== undefined
                              ? checkedOptions[option._id]
                              : originalBicycle?.partOptions.includes(
                                  option._id
                                )
                          }
                          onChange={handlePartOptionChange}
                        />
                        <label className="form-check-label">
                          {option.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveBicycle}>
            {isEditing ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminBicycles;
