// src/components/loadingSpinner/LoadingSpinner.js

import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
