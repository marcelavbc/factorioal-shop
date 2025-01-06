import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";

const AdminModal = ({ show, onHide, title, children, onSave, isEditing }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName="custom-modal-size"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onSave}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
AdminModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onSave: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
};

export default AdminModal;
