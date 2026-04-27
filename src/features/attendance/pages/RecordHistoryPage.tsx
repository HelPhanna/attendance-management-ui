import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  downloadRecordHistoryItem,
  fetchRecordHistory,
  type RecordHistoryItem,
} from "@features/attendance/api/recordHistoryApi";

function toDisplayDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toISOString().slice(0, 10);
}

function toSizeLabel(sizeKb: number): string {
  if (sizeKb >= 1024) {
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  }
  return `${Math.round(sizeKb)} KB`;
}

function parseSearchInput(value: string): { search?: string; date?: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { date: trimmed };
  }

  return { search: trimmed };
}

function statusBadge(status: RecordHistoryItem["status"]) {
  if (status === "failed") {
    return "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600";
  }
  return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600";
}

export default function RecordHistoryPage() {
  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState<RecordHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingId, setIsDownloadingId] = useState<number | null>(null);

  const query = useMemo(() => parseSearchInput(keyword), [keyword]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRecordHistory(query);
      setRows(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load history.";
      toast.error(message);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.search, query.date]);

  const handleDownload = async (id: number, status: RecordHistoryItem["status"]) => {
    if (status !== "completed") {
      toast.error("Only completed files can be downloaded.");
      return;
    }

    setIsDownloadingId(id);
    try {
      await downloadRecordHistoryItem(id);
      toast.success("Download started.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Download failed.";
      toast.error(message);
    } finally {
      setIsDownloadingId(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-slate-100 pb-10">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by class or date..."
            className="h-11 w-full max-w-md rounded border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-500"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadHistory()}
              className="inline-flex h-11 items-center gap-2 rounded border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="m4 4 6 8v6l4 2v-8l6-8z" />
              </svg>
              Filter
            </button>
            <button
              type="button"
              onClick={() => void loadHistory()}
              className="inline-flex h-11 items-center gap-2 rounded border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M12 3v10" />
                <path d="m8.5 9.5 3.5 3.5 3.5-3.5" />
                <path d="M4 16v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2" />
              </svg>
              Export Log
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Class Name</th>
                <th className="px-6 py-3 font-medium">File Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading record history...
                  </td>
                </tr>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No export history found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200 text-slate-700">
                    <td className="px-6 py-4">{toDisplayDate(row.date)}</td>
                    <td className="px-6 py-4">{row.class_name}</td>
                    <td className="px-6 py-4">{row.file_type}</td>
                    <td className="px-6 py-4">
                      <span className={statusBadge(row.status)}>
                        {row.status === "failed" ? "Failed" : "Completed"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{toSizeLabel(row.size_kb)}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => void handleDownload(row.id, row.status)}
                        disabled={row.status !== "completed" || isDownloadingId === row.id}
                        className="inline-flex h-8 items-center gap-2 rounded bg-indigo-50 px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path d="M12 3v10" />
                          <path d="m8.5 9.5 3.5 3.5 3.5-3.5" />
                          <path d="M4 16v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2" />
                        </svg>
                        {isDownloadingId === row.id ? "Downloading..." : "Download"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
