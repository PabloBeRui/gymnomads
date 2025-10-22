import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Envolver App con BrowserRouter para habilitar el enrutamiento */}
    {/* Wrap App with BrowserRouter to enable routing */}
    <BrowserRouter>
      {/* Envolver App con AuthProvider para que el contexto esté disponible */}
      {/* Wrap App with AuthProvider so the context is available */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
