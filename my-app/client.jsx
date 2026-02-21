import React from "react";
import { createRoot } from "react-dom/client";
import Chat from "./Chat.jsx";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<Chat />);
}
