import { apiRequest } from "@shared/api/http";
import { getAuthToken } from "@shared/auth/session";

export type ExportStatus = "completed" | "failed";

export type RecordHistoryItem = {
  id: number;
  date: string;
  class_name: string;
  file_type: string;
  status: ExportStatus;
  size_kb: number;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000/api";

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function normalizeStatus(value: unknown): ExportStatus {
  if (value === "failed") {
    return "failed";
  }
  return "completed";
}

export async function fetchRecordHistory(params?: { search?: string; date?: string }) {
  const query = new URLSearchParams();

  if (params?.search?.trim()) {
    query.append("search", params.search.trim());
  }

  if (params?.date?.trim()) {
    query.append("date", params.date.trim());
  }

  const response = await apiRequest<{ success: boolean; data?: unknown }>(
    `/report-export/history${query.toString() ? `?${query.toString()}` : ""}`,
  );

  const rows = asArray<{
    id: number;
    date: string;
    class_name: string;
    file_type: string;
    status: unknown;
    size_kb: number;
  }>(response.data);

  return rows.map((row) => ({
    id: toNumber(row.id),
    date: row.date,
    class_name: row.class_name || "-",
    file_type: row.file_type || "-",
    status: normalizeStatus(row.status),
    size_kb: toNumber(row.size_kb),
  }));
}

export async function downloadRecordHistoryItem(id: number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/report-export/${id}/download`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] || `attendance-report-${id}`;

  const fileUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = fileUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(fileUrl);
}
