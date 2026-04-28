import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { LabProvider } from "./state/LabContext.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LabProvider>
        <App />
      </LabProvider>
    </BrowserRouter>
  </React.StrictMode>
);
