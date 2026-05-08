import { apiRequest } from "@shared/api/http";
import { getAuthToken } from "@shared/auth/session";

export type Term = {
  id: number;
  name: string;
  academic_year_id?: number;
};

export type AcademicYear = {
  id: number;
  name: string;
};

export type ClassItem = {
  id: number;
  name: string;
};

export type ClassSession = {
  id: number;
  class_id: number;
  term_id: number;
  teacher_id: number;
  start_time: string;
  end_time: string;
};

export type TeacherItem = {
  id: number;
  name: string;
};

export type StudentItem = {
  id: number;
  student_code: string;
  name: string;
};

export type FilterStudentResult = {
  student_id: number;
  student_code: string;
  name: string;
  status: "present" | "absent" | "permission" | null;
  comment: string | null;
};

export type FilterAttendanceResponse = {
  class_session_id: number;
  students: FilterStudentResult[];
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

export async function fetchTerms(): Promise<Term[]> {
  const response = await apiRequest<{ list?: unknown }>("/term");
  const list = asArray<{ id: number; name: string; academic_year_id?: number }>(
    response.list,
  );

  return list.map((term) => ({
    id: toNumber(term.id),
    name: term.name,
    academic_year_id: term.academic_year_id
      ? toNumber(term.academic_year_id)
      : undefined,
  }));
}

export async function fetchAcademicYears(): Promise<AcademicYear[]> {
  const response = await apiRequest<{ list?: unknown }>("/academic-year");
  const list = asArray<{ id: number; name: string }>(response.list);

  return list.map((item) => ({
    id: toNumber(item.id),
    name: item.name,
  }));
}

export async function fetchClasses(): Promise<ClassItem[]> {
  const response = await apiRequest<{ list?: { data?: unknown } }>("/classes");
  const list = asArray<{ id: number; name: string }>(response.list?.data);

  return list.map((item) => ({
    id: toNumber(item.id),
    name: item.name,
  }));
}

export async function fetchClassSessions(): Promise<ClassSession[]> {
  const response = await apiRequest<{ list?: { data?: unknown } }>(
    "/class-session",
  );
  const list = asArray<ClassSession>(response.list?.data);

  return list.map((item) => ({
    id: toNumber(item.id),
    class_id: toNumber(item.class_id),
    term_id: toNumber(item.term_id),
    teacher_id: toNumber(item.teacher_id),
    start_time: item.start_time,
    end_time: item.end_time,
  }));
}

export async function fetchTeachersFallbackFromSessions(
  sessions: ClassSession[],
): Promise<TeacherItem[]> {
  const uniqueIds = [...new Set(sessions.map((session) => session.teacher_id))];
  return uniqueIds.map((id) => ({
    id,
    name: `Teacher #${id}`,
  }));
}

export async function fetchTeachers(): Promise<TeacherItem[]> {
  const response = await apiRequest<{
    success?: boolean;
    data?: unknown;
  }>("/teachers");

  const data = asArray<{
    id: number;
    user?: { name?: string };
    teacher_code?: string;
  }>(response.data);

  return data.map((teacher) => ({
    id: toNumber(teacher.id),
    name:
      teacher.user?.name ||
      teacher.teacher_code ||
      `Teacher #${toNumber(teacher.id)}`,
  }));
}

export async function fetchStudents(): Promise<StudentItem[]> {
  const response = await apiRequest<{
    success?: boolean;
    data?: unknown;
  }>("/students");

  const list = asArray<{
    id: number;
    student_code?: string;
    user?: { name?: string };
  }>(response.data);

  return list.map((student) => ({
    id: toNumber(student.id),
    student_code: student.student_code || `S${toNumber(student.id)}`,
    name: student.user?.name || `Student #${toNumber(student.id)}`,
  }));
}

export async function filterAttendance(params: {
  date: string;
  term_id: number;
  class_id: number;
  teacher_id: number;
  start_time: string;
  end_time: string;
}): Promise<FilterAttendanceResponse> {
  const query = new URLSearchParams({
    date: params.date,
    term_id: String(params.term_id),
    class_id: String(params.class_id),
    teacher_id: String(params.teacher_id),
    start_time: params.start_time,
    end_time: params.end_time,
  });

  const response = await apiRequest<{
    success: boolean;
    data?: {
      class_session_id: number;
      students: FilterStudentResult[];
    };
  }>(`/attendance-records/filter?${query.toString()}`);

  return {
    class_session_id: toNumber(response.data?.class_session_id),
    students: asArray<FilterStudentResult>(response.data?.students),
  };
}

export async function saveAttendanceRecords(params: {
  date: string;
  class_session_id: number;
  records: Array<{
    student_id: number;
    status: "present" | "absent" | "permission" | null;
    comment: string | null;
  }>;
}) {
  return apiRequest<{ success: boolean; message: string }>(
    "/attendance-records",
    {
      method: "PUT",
      body: params,
    },
  );
}

export async function exportAttendanceReport(
  format: "pdf" | "xlsx",
  payload: {
    date: string;
    term_id: number;
    class_id: number;
    teacher_id: number;
    class_session_id?: number;
    start_time: string;
    end_time: string;
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
    let message = `Export failed (${response.status})`;
    try {
      const errorData = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };
      if (errorData?.message) {
        message = errorData.message;
      }
      if (errorData?.errors) {
        const firstErrorGroup = Object.values(errorData.errors)[0];
        const firstError = Array.isArray(firstErrorGroup)
          ? firstErrorGroup[0]
          : undefined;
        if (firstError) {
          message = `${message}: ${firstError}`;
        }
      }
    } catch {
      // Keep generic message when response body is not JSON.
    }
    throw new Error(message);
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
