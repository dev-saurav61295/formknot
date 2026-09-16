import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("FormKnot demo: #root element not found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
