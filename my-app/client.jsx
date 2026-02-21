import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Chat from "./Chat.jsx";
import Cadastro from "./Cadastro.jsx";

function App() {
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/$/, "") || "/");

  useEffect(() => {
    function onPopState() {
      setPath(window.location.pathname.replace(/\/$/, "") || "/");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return path === "/cadastro" ? <Cadastro /> : <Chat />;
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
