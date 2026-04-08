// src/App.js
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { store } from "./store";
import "./styles/globals.css";
import NetworkStatusNotifier from "./utils/NetworkStatusNotifier";
import AppRoutes from "./routes";

// Theme initializer component
const ThemeInitializer = () => {
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return null;
};

const AppContent = () => {
  return (
    <>
      <ThemeInitializer />
        <Router>
          <AppRoutes />
        </Router>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
      <Toaster />
      <NetworkStatusNotifier />
    </Provider>
  );
}

export default App;