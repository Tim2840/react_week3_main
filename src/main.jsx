import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/all.scss";
import App from "./App.jsx";
import MyApp from "./MyApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MyApp />
  </StrictMode>,
);
