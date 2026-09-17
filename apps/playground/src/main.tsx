import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./components/MonacoEditor/setup";
import { App } from "./App";
import "./styles.css";
import "./components/APIPlayground/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
