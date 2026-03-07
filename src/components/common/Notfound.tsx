import React from "react";

export default function Notfound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-sm text-slate-600">Page not found</p>

        <a
          href="/"
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
