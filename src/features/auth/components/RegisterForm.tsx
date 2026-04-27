import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { setRegisterField } from "@features/auth/store/authSlice";
import AuthShell from "./AuthShell";

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => state.auth.registerForm);

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Fill in the details below to register."
    >
      <form className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Full Name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) =>
              dispatch(
                setRegisterField({ field: "fullName", value: event.target.value }),
              )
            }
            placeholder="Enter your full name"
            className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              dispatch(
                setRegisterField({ field: "email", value: event.target.value }),
              )
            }
            placeholder="Enter your email"
            className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              dispatch(
                setRegisterField({ field: "password", value: event.target.value }),
              )
            }
            placeholder="Create a password"
            className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Confirm Password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              dispatch(
                setRegisterField({
                  field: "confirmPassword",
                  value: event.target.value,
                }),
              )
            }
            placeholder="Confirm your password"
            className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(event) =>
              dispatch(
                setRegisterField({
                  field: "acceptedTerms",
                  value: event.target.checked,
                }),
              )
            }
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
          />
          <p className="text-xs text-slate-600">
            I agree to the{" "}
            <a href="#" className="text-slate-700 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-slate-700 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex h-10 w-full items-center justify-center rounded bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          Create Account
        </button>
        <p className="pt-1 text-center text-xs text-slate-600">
          Already have an account?{" "}
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
