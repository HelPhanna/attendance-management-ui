import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutApi } from "@features/auth/api/authApi";
import { SESSION_UPDATED_EVENT, clearSession, getDisplayName, getSession } from "@shared/auth/session";
import SchoolBadgeIcon from "./SchoolBadgeIcon";

const attendanceTabs = [
  { label: "Attendance Recording", to: "/dashboard/attendance" },
  { label: "Reports & Analytics", to: "/dashboard/reports" },
  { label: "Blacklist System", to: "/dashboard/blacklist" },
];

function sectionTitleFromPath(pathname: string): string {
  if (pathname.startsWith("/dashboard/history")) {
    return "Record History";
  }
  if (pathname.startsWith("/dashboard/profile")) {
    return "Profile Settings";
  }
  if (pathname.startsWith("/dashboard/settings")) {
    return "Settings";
  }
  if (pathname.startsWith("/dashboard/admin")) {
    return "Admin Management";
  }
  if (pathname.startsWith("/dashboard/reports")) {
    return "Reports & Analytics";
  }
  if (pathname.startsWith("/dashboard/blacklist")) {
    return "Blacklist Management";
  }
  return "Attendance Register";
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession);

  // Re-render whenever saveSession() is called (e.g. after profile image upload)
  useEffect(() => {
    function onSessionUpdated() {
      setSession(getSession());
    }
    window.addEventListener(SESSION_UPDATED_EVENT, onSessionUpdated);
    return () => window.removeEventListener(SESSION_UPDATED_EVENT, onSessionUpdated);
  }, []);

  const pathname = location.pathname;
  const isSettingsPage = pathname.startsWith("/dashboard/settings");
  const isProfilePage = pathname.startsWith("/dashboard/profile");
  const isHistoryPage = pathname.startsWith("/dashboard/history");
  const showAttendanceTabs = !isSettingsPage && !isProfilePage && !isHistoryPage;
  const sectionTitle = sectionTitleFromPath(pathname);

  const userDisplayName = getDisplayName(session?.user);
  const userRole = session?.user?.roles?.[0]?.name || "Teacher";
  const isAdmin = (session?.user?.roles ?? []).some((r) => {
    const name = (r.name ?? "").toLowerCase();
    const key  = (r.key  ?? "").toLowerCase();
    return name === "super_admin" || name === "admin" || key === "super_admin" || key === "admin";
  });
  const profileImage = session?.user?.userProfile?.image?.trim() || "";
  const initials = userDisplayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const apiBase = import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000/api";
  const apiOrigin = apiBase.replace(/\/api\/?$/, "");
  const profileImageUrl = profileImage
    ? profileImage.startsWith("http://") ||
      profileImage.startsWith("https://") ||
      profileImage.startsWith("data:") ||
      profileImage.startsWith("blob:")
      ? profileImage
      : profileImage.startsWith("/")
      ? `${apiOrigin}${profileImage}`
      : profileImage.startsWith("storage/")
      ? `${apiOrigin}/${profileImage}`
      : `${apiOrigin}/storage/${profileImage}`
    : null;

  const handleLogout = async () => {
    try {
      if (session?.token) {
        await logoutApi();
      }
    } catch {
      // ignore logout API errors and clear local session anyway
    } finally {
      clearSession();
      toast.success("Logged out.");
      navigate("/auth/login");
    }
  };

  return (
    <header className="w-full">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-600 bg-slate-800">
              <SchoolBadgeIcon className="h-6 w-6 text-slate-200" />
            </div>
            <div className="leading-tight">
              <p className="text-xl font-semibold">Class Attendance</p>
              <p className="text-[11px] text-slate-300">SETEC Portal v1</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              aria-label="Notifications"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M15 17H5a2 2 0 0 1-1.8-2.9A4 4 0 0 0 4 11.3V9a8 8 0 1 1 16 0v2.3a4 4 0 0 0 .8 2.8A2 2 0 0 1 19 17h-4" />
                <path d="M9 17a3 3 0 0 0 6 0" />
              </svg>
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold">{userDisplayName}</p>
              <p className="text-[11px] text-slate-300">{userRole}</p>
            </div>
            <Link to="/dashboard/profile" aria-label="Profile settings">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={userDisplayName}
                  className="h-10 w-10 rounded-full border border-slate-600 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-sm font-semibold text-slate-200">
                  {initials || "T"}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          <h1 className="text-3xl font-semibold text-slate-800">{sectionTitle}</h1>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            {isAdmin && (
              <Link
                to="/dashboard/admin"
                className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-indigo-600 hover:bg-indigo-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Admin
              </Link>
            )}
            <Link
              to="/dashboard/history"
              className="inline-flex items-center gap-1 hover:text-slate-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M12 8v5l3 2" />
                <path d="M22 12a10 10 0 1 1-3-7.2" />
              </svg>
              History
            </Link>
            <Link
              to="/dashboard/settings"
              className="inline-flex items-center gap-1 hover:text-slate-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 hover:text-slate-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {showAttendanceTabs && (
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex gap-6">
              {attendanceTabs.map((tab) => {
                const isActive = pathname.startsWith(tab.to);

                return (
                  <Link
                    key={tab.label}
                    to={tab.to}
                    className={[
                      "relative py-4 text-base font-medium transition",
                      isActive
                        ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded after:bg-slate-900"
                        : "text-slate-500 hover:text-slate-800",
                    ].join(" ")}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
