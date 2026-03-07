import React from "react";

export default function Register() {
  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded bg-slate-900 shadow-sm">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.6667 29.3333V24C18.6667 23.2928 18.3858 22.6145 17.8857 22.1144C17.3856 21.6143 16.7073 21.3333 16 21.3333C15.2928 21.3333 14.6145 21.6143 14.1144 22.1144C13.6143 22.6145 13.3334 23.2928 13.3334 24V29.3333"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M24 13.3333L28.596 15.632C28.8174 15.7426 29.0037 15.9128 29.1339 16.1233C29.2641 16.3338 29.3332 16.5764 29.3333 16.824V26.6667C29.3333 27.3739 29.0523 28.0522 28.5522 28.5523C28.0521 29.0524 27.3739 29.3333 26.6666 29.3333H5.33329C4.62605 29.3333 3.94777 29.0524 3.44767 28.5523C2.94758 28.0522 2.66663 27.3739 2.66663 26.6667V16.824C2.66676 16.5764 2.7358 16.3338 2.86603 16.1233C2.99625 15.9128 3.18252 15.7426 3.40396 15.632L7.99996 13.3333"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M24 6.66667V29.3333"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M5.33337 8.00001L14.808 3.26267C15.1782 3.07772 15.5863 2.98143 16 2.98143C16.4138 2.98143 16.8219 3.07772 17.192 3.26267L26.6667 8.00001"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 6.66667V29.3333"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16 14.6667C17.4728 14.6667 18.6667 13.4728 18.6667 12C18.6667 10.5272 17.4728 9.33333 16 9.33333C14.5273 9.33333 13.3334 10.5272 13.3334 12C13.3334 13.4728 14.5273 14.6667 16 14.6667Z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-center text-lg font-bold tracking-wide">
            SETEC INSTITUTE
          </h1>
          <p className="mt-1 text-center text-xs text-slate-500">
            SETEC Portal Access
          </p>
        </div>
        <div className="w-full max-w-md rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="mt-0.5 h-10 w-1 bg-slate-900" />
              <div>
                <h2 className="text-sm font-semibold">Create Your Account</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Fill in the details below to register.
                </p>
              </div>
            </div>

            <form className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              {/* <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div> */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="h-10 w-full rounded border border-slate-200 bg-white px-3 pr-10 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded px-2 text-slate-400 hover:text-slate-600"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
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
                className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Create Account
                <span aria-hidden className="text-base leading-none">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33337 8H12.6667"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8 3.33331L12.6667 7.99998L8 12.6666"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <p className="pt-1 text-center text-xs text-slate-600">
                Already have an account?{" "}
                <a
                  href="login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
                </a>
              </p>
            </form>
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-center text-[11px] text-slate-500">
              Protected by SETEC Institute Attendance System v1
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-[11px] text-slate-400">
            © 2025 SETEC Institute. All rights reserved.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <a href="#" className="hover:text-slate-600 hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-600 hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-600 hover:underline">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
