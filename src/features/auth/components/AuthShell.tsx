import type { PropsWithChildren, ReactNode } from "react";
import SchoolBadgeIcon from "@shared/components/SchoolBadgeIcon";

type AuthShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}>;

const DEFAULT_FOOTER = (
  <>
    <p className="text-center text-[11px] text-slate-400">
      (c) 2026 SETEC Institute. All rights reserved.
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
  </>
);

export default function AuthShell({
  title,
  subtitle,
  footer = DEFAULT_FOOTER,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded bg-slate-900 shadow-sm">
            <SchoolBadgeIcon className="h-8 w-8 text-white" />
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
                <h2 className="text-sm font-semibold">{title}</h2>
                {subtitle ? (
                  <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
                ) : null}
              </div>
            </div>
            {children}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-center text-[11px] text-slate-500">
              Protected by SETEC Institute Attendance System v1
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">{footer}</div>
      </div>
    </div>
  );
}
