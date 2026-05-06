import { apiRequest } from "@shared/api/http";

// ─── Types ────────────────────────────────────────────────────────────────

export type Role = {
  id: number;
  name: string;
  key?: string;
};

export type UserWithRoles = {
  id: number;
  name: string;
  email: string;
  status?: string;
  roles: Role[];
};

export type AcademicYear = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
};

export type Term = {
  id: number;
  name: string;
  academic_year_id: number;
  start_date: string;
  end_date: string;
};

export type Student = {
  id: number;
  student_code?: string;
  status?: string;
  user?: { id: number; name: string; email: string };
};

export type EnrollmentItem = {
  id: number;
  class_id: number;
  student_id: number;
  grade_level_id?: number;
  enrolled_on?: string;
  student?: Student;
  classes?: { id: number; name: string };
};

export type ClassItem = {
  id: number;
  name: string;
  grade_level_id: number;
  room_number?: string;
};

export type GradeLevelItem = {
  id: number;
  name: string;
};

export type TeacherItem = {
  id: number;
  teacher_code?: string;
  user?: { id: number; name: string };
};

export type SubjectItem = {
  id: number;
  name: string;
};

export type ClassSessionItem = {
  id: number;
  class_id: number;
  term_id: number;
  teacher_id: number;
  subject_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  status?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

// ─── Users & Roles ────────────────────────────────────────────────────────

export async function fetchUsersWithRoles(): Promise<UserWithRoles[]> {
  const res = await apiRequest<{ success: boolean; data: unknown }>(
    "/user-roles",
  );
  return asArray<UserWithRoles>(res.data);
}

export async function fetchAllRoles(): Promise<Role[]> {
  const res = await apiRequest<{ list?: { data?: unknown } }>("/roles");
  return asArray<Role>((res as any).list?.data);
}

export async function deleteUser(userId: number) {
  return apiRequest(`/users/${userId}`, { method: "DELETE" });
}

export async function assignUserRoles(userId: number, roleIds: number[]) {
  return apiRequest("/user-roles/create", {
    method: "POST",
    body: { user_id: userId, role_id: roleIds },
  });
}

export async function updateUserRoles(userId: number, roleIds: number[]) {
  return apiRequest("/user-roles/update", {
    method: "POST",
    body: { user_id: userId, role_id: roleIds },
  });
}

export async function createUserAccount(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

// ─── Academic Years ───────────────────────────────────────────────────────

export async function fetchAcademicYears(): Promise<AcademicYear[]> {
  const res = await apiRequest<{ list: unknown }>("/academic-year");
  return asArray<AcademicYear>((res as any).list);
}

export async function createAcademicYear(payload: {
  name: string;
  start_date: string;
  end_date: string;
}) {
  return apiRequest("/academic-year", { method: "POST", body: payload });
}

export async function updateAcademicYear(
  id: number,
  payload: { name: string; start_date: string; end_date: string },
) {
  return apiRequest(`/academic-year/${id}`, { method: "PUT", body: payload });
}

export async function deleteAcademicYear(id: number) {
  return apiRequest(`/academic-year/${id}`, { method: "DELETE" });
}

// ─── Terms ────────────────────────────────────────────────────────────────

export async function fetchTerms(): Promise<Term[]> {
  const res = await apiRequest<{ list: unknown }>("/term");
  return asArray<Term>((res as any).list);
}

export async function createTerm(payload: {
  name: string;
  academic_year_id: number;
  start_date: string;
  end_date: string;
}) {
  return apiRequest("/term", { method: "POST", body: payload });
}

export async function updateTerm(
  id: number,
  payload: {
    name: string;
    academic_year_id: number;
    start_date: string;
    end_date: string;
  },
) {
  return apiRequest(`/term/${id}`, { method: "PUT", body: payload });
}

export async function deleteTerm(id: number) {
  return apiRequest(`/term/${id}`, { method: "DELETE" });
}

// ─── Enrollments ─────────────────────────────────────────────────────────

export async function fetchEnrollments(): Promise<EnrollmentItem[]> {
  const res = await apiRequest<{ list: { data: unknown } }>("/enrollments");
  return asArray<EnrollmentItem>((res as any).list?.data);
}

export async function fetchStudents(): Promise<Student[]> {
  const res = await apiRequest<{ data: unknown; list?: { data: unknown } }>(
    "/students",
  );
  return asArray<Student>((res as any).list?.data ?? (res as any).data);
}

export async function fetchClassesForAdmin(): Promise<ClassItem[]> {
  const res = await apiRequest<{ list: { data: unknown } }>("/classes");
  return asArray<ClassItem>((res as any).list?.data);
}

export async function createEnrollment(payload: {
  class_id: number;
  student_id: number;
  enrolled_on?: string;
}) {
  return apiRequest("/enrollments/create", { method: "POST", body: payload });
}

export async function deleteEnrollment(id: number) {
  return apiRequest(`/enrollments/${id}`, { method: "DELETE" });
}

// ─── Class Sessions ───────────────────────────────────────────────────────

export async function fetchClassSessions(): Promise<ClassSessionItem[]> {
  const res = await apiRequest<{ list: { data: unknown } }>("/class-session");
  return asArray<ClassSessionItem>((res as any).list?.data);
}

export async function fetchTeachersForAdmin(): Promise<TeacherItem[]> {
  const res = await apiRequest<{ data: unknown }>("/teachers");
  return asArray<TeacherItem>((res as any).data);
}

export async function fetchSubjects(): Promise<SubjectItem[]> {
  const res = await apiRequest<{ data: unknown }>("/grade-level-subjects");
  return asArray<SubjectItem>((res as any).list?.data ?? (res as any).data);
}

export async function createClassSession(payload: {
  class_id: number;
  term_id: number;
  teacher_id: number;
  subject_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}) {
  return apiRequest("/class-session", { method: "POST", body: payload });
}

export async function deleteClassSession(id: number) {
  return apiRequest(`/class-session/${id}`, { method: "DELETE" });
}
