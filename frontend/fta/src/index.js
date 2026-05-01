import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { AuthProvider } from "./context/AuthProvider";
import { EntityProvider } from "./context/EntityContext";


import './index.css'
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <EntityProvider>
        <App />
      </EntityProvider>
    </AuthProvider>
  </React.StrictMode>
);
