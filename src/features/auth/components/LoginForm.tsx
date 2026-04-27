import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { loginApi } from "@features/auth/api/authApi";
import { setLoginField } from "@features/auth/store/authSlice";
import { saveSession } from "@shared/auth/session";
import AuthShell from "./AuthShell";

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { usernameOrEmail, password, rememberMe } = useAppSelector(
    (state) => state.auth.loginForm,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!usernameOrEmail.trim() || !password.trim()) {
      toast.error("Please enter email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginApi(usernameOrEmail.trim(), password);

      saveSession({
        token: response.token,
        user: response.user,
      });

      if (rememberMe) {
        localStorage.setItem("attendance_remember_email", usernameOrEmail.trim());
      } else {
        localStorage.removeItem("attendance_remember_email");
      }

      toast.success("Sign in successful.");
      navigate("/dashboard/attendance");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign In to Your Account"
      subtitle="Welcome back. Please enter your credentials."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500">Email</label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(event) =>
              dispatch(
                setLoginField({
                  field: "usernameOrEmail",
                  value: event.target.value,
                }),
              )
            }
            placeholder="Enter your email"
            className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                dispatch(
                  setLoginField({
                    field: "password",
                    value: event.target.value,
                  }),
                )
              }
              placeholder="Enter your password"
              className="h-10 w-full rounded border border-slate-200 bg-white px-3 pr-10 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.58 10.58C10.209 10.951 10 11.4543 10 11.979C10 12.5038 10.209 13.0071 10.58 13.378C10.951 13.749 11.4543 13.958 11.979 13.958C12.5038 13.958 13.0071 13.749 13.378 13.378"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.36201 5.36502C10.2264 5.12143 11.1204 4.99798 12.0185 4.99802C17.0185 4.99802 21 11.998 21 11.998C20.3958 13.129 19.5583 14.1183 18.544 14.899"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.12 14.12C13.4569 14.6271 12.6445 14.8997 11.81 14.895C6.81 14.895 3 11.998 3 11.998C3.6284 10.8228 4.51038 9.80258 5.582 9.01102"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                dispatch(
                  setLoginField({
                    field: "rememberMe",
                    value: event.target.checked,
                  }),
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
            />
            Remember me
          </label>

          <Link
            to="/auth/recovery"
            className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-10 w-full items-center justify-center rounded bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
        <p className="pt-2 text-center text-xs text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-slate-900 hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
