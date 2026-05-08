import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./app/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "8px",
            background: "#0f172a",
            color: "#ffffff",
          },
        }}
      />
    </Provider>
  </StrictMode>,
);
