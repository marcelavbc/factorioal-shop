import React from "react";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes";

const App = () => {
  return (
    <div className="container">
      <AppRoutes />
      <ToastContainer />
    </div>
  );
};

export default App;
