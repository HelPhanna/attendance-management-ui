import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import ForgotPasswordPage from "@features/auth/pages/ForgotPasswordPage";
import LoginPage from "@features/auth/pages/LoginPage";
import RegisterPage from "@features/auth/pages/RegisterPage";
import AttendancePage from "@features/attendance/pages/AttendancePage";
import BlacklistSystemPage from "@features/attendance/pages/BlacklistSystemPage";
import RecordHistoryPage from "@features/attendance/pages/RecordHistoryPage";
import ReportsAnalyticsPage from "@features/attendance/pages/ReportsAnalyticsPage";
import DashboardPage from "@features/dashboard/pages/DashboardPage";
import LayoutMainPage from "@features/layout/pages/LayoutMainPage";
import NotFoundPage from "@features/not-found/pages/NotFoundPage";
import ProfileSettingsPage from "@features/settings/pages/ProfileSettingsPage";
import SettingsPage from "@features/settings/pages/SettingsPage";
import { getSession } from "@shared/auth/session";

function RequireAuth({ children }: { children: ReactElement }) {
  if (!getSession()?.token) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <LayoutMainPage />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="reports" element={<ReportsAnalyticsPage />} />
        <Route path="blacklist" element={<BlacklistSystemPage />} />
        <Route path="history" element={<RecordHistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfileSettingsPage />} />
      </Route>

      <Route path="/attendance" element={<Navigate to="/dashboard/attendance" replace />} />

      <Route path="/auth">
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="recovery" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
