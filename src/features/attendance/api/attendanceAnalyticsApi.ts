import { apiRequest } from "@shared/api/http";
import { getAuthToken } from "@shared/auth/session";

type StatusType = "blacklisted" | "warning" | "good_standing";

export type DailyAttendanceRow = {
  date: string;
  class_name: string;
  present: number;
  absent: number;
  permission: number;
  rate: number;
};

export type ReportSummary = {
  classes_held: number;
  avg_attendance: number;
  total_present: number;
  total_absent: number;
  total_permission: number;
};

export type ReportSummaryResponse = {
  summary: ReportSummary;
  daily: DailyAttendanceRow[];
};

export type BlacklistRow = {
  student_id: number;
  roll_no: string;
  student_name: string;
  total_absences: number;
  attendance_rate: number;
  status: StatusType;
  present_count: number;
  permission_count: number;
};

export type BlacklistSummary = {
  threshold: number;
  total_students: number;
  blacklisted_count: number;
  warning_count: number;
  good_standing_count: number;
};

export type BlacklistResponse = {
  summary: BlacklistSummary;
  rows: BlacklistRow[];
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

export async function fetchReportSummary(params: {
  date_from: string;
  date_to: string;
  academic_year_id: number;
  term_id: number;
  class_id: number;
}): Promise<ReportSummaryResponse> {
  const query = new URLSearchParams({
    date_from: params.date_from,
    date_to: params.date_to,
    academic_year_id: String(params.academic_year_id),
    term_id: String(params.term_id),
    class_id: String(params.class_id),
  });

  const response = await apiRequest<{
    success: boolean;
    data?: {
      summary?: ReportSummary;
      daily?: unknown;
    };
  }>(`/attendance-analytics/report-summary?${query.toString()}`);

  const summary = response.data?.summary;
  const daily = asArray<DailyAttendanceRow>(response.data?.daily);

  return {
    summary: {
      classes_held: toNumber(summary?.classes_held),
      avg_attendance: toNumber(summary?.avg_attendance),
      total_present: toNumber(summary?.total_present),
      total_absent: toNumber(summary?.total_absent),
      total_permission: toNumber(summary?.total_permission),
    },
    daily: daily.map((row) => ({
      date: row.date,
      class_name: row.class_name,
      present: toNumber(row.present),
      absent: toNumber(row.absent),
      permission: toNumber(row.permission),
      rate: toNumber(row.rate),
    })),
  };
}

export async function fetchBlacklistOverview(params: {
  academic_year_id: number;
  term_id: number;
  threshold: number;
  search?: string;
}): Promise<BlacklistResponse> {
  const query = new URLSearchParams({
    academic_year_id: String(params.academic_year_id),
    term_id: String(params.term_id),
    threshold: String(params.threshold),
  });

  if (params.search?.trim()) {
    query.append("search", params.search.trim());
  }

  const response = await apiRequest<{
    success: boolean;
    data?: {
      summary?: BlacklistSummary;
      rows?: unknown;
    };
  }>(`/attendance-analytics/blacklist-overview?${query.toString()}`);

  const summary = response.data?.summary;
  const rows = asArray<BlacklistRow>(response.data?.rows);

  return {
    summary: {
      threshold: toNumber(summary?.threshold),
      total_students: toNumber(summary?.total_students),
      blacklisted_count: toNumber(summary?.blacklisted_count),
      warning_count: toNumber(summary?.warning_count),
      good_standing_count: toNumber(summary?.good_standing_count),
    },
    rows: rows.map((row) => ({
      student_id: toNumber(row.student_id),
      roll_no: row.roll_no,
      student_name: row.student_name,
      total_absences: toNumber(row.total_absences),
      attendance_rate: toNumber(row.attendance_rate),
      status: row.status,
      present_count: toNumber(row.present_count),
      permission_count: toNumber(row.permission_count),
    })),
  };
}

export async function exportAttendanceAnalytics(
  format: "pdf" | "xlsx",
  payload: {
    date_from: string;
    date_to: string;
    academic_year_id: number;
    term_id: number;
    class_id: number;
  },
) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/report-export/${format}`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      Accept: "application/octet-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Export failed (${response.status})`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] || `attendance-report.${format}`;

  const fileUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = fileUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(fileUrl);
}
