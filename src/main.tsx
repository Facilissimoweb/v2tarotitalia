import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applySiteLocale } from "./lib/locale";
import { initAccessibility } from "./lib/accessibility";
import "./index.css";

applySiteLocale();
initAccessibility();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
