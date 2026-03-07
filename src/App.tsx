import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LayoutMainPage from "./pages/layout/LayoutMainPage";
import NotfoundPage from "./pages/notfound/NotfoundPage";
import Testing from "./pages/Testing/Testing";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutMainPage />}>
          <Route index element={<Testing />} />
        </Route>

        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="recovery" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="*" element={<NotfoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
