// src/components/error/ErrorMessage.js

import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="alert alert-danger text-center" role="alert">
      {message || "Something went wrong. Please try again."}
    </div>
  );
};

export default ErrorMessage;
