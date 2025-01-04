import React from "react";
import PropTypes from "prop-types";

const ErrorMessage = ({ message }) => {
  return (
    <div className="alert alert-danger text-center" role="alert">
      {message || "Something went wrong. Please try again."}
    </div>
  );
};

export default ErrorMessage;

ErrorMessage.propTypes = {
  message: PropTypes.string,
};
