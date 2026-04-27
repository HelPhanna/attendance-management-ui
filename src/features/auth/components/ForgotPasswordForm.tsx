import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { setForgotPasswordEmail } from "@features/auth/store/authSlice";
import AuthShell from "./AuthShell";

export default function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const email = useAppSelector((state) => state.auth.forgotPasswordForm.email);

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your email and we will send your reset link."
    >
      <form className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => dispatch(setForgotPasswordEmail(event.target.value))}
            placeholder="Enter your registered email"
            className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex h-10 w-full items-center justify-center rounded bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          Send Reset Link
        </button>

        <p className="pt-1 text-center text-xs text-slate-600">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
