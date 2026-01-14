// Importăm React (necesar pentru a putea randa componente)
import React from "react";

// Importăm ReactDOM pentru a atașa aplicația în pagina HTML
import ReactDOM from "react-dom/client";

// Importăm componenta principală a aplicației
import App from "./App.jsx";

// Importăm fișierul CSS global
// IMPORTANT: aici se încarcă Tailwind CSS și stilurile pentru light/dark mode
import "./index.css";

// Montăm aplicația React în elementul <div id="root"> din index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode ajută la detectarea problemelor în timpul dezvoltării
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
