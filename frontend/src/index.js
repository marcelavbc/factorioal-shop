import React from "react";
import ReactDOM from "react-dom/client"; // Import from 'react-dom/client'
import App from "./App"; // Your main app component
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS if needed
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// Get the root element
const rootElement = document.getElementById("root");

// Create the root
const root = ReactDOM.createRoot(rootElement);

// Render your application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
