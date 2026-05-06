import { apiRequest, apiRequestFormData } from "@shared/api/http";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type ClassApiItem = {
  id: number;
  name: string;
  grade_level_id: number;
  room_number?: string | null;
  students?: unknown[];
};

type ClassSessionApiItem = {
  id: number;
  class_id: number;
  teacher_id: number;
  day_of_week: string;
};

type TeacherApiItem = {
  id: number;
  user?: {
    name?: string;
  };
  teacher_code?: string;
};

type GradeLevelApiItem = {
  id: number;
  name: string;
};

type UserProfileApi = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
};

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  image: string;
};

export type SchoolSettings = {
  schoolName: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  currentAcademicYear: string;
  termSemester: string;
};

export type AttendanceRules = {
  lateThresholdMinutes: number;
  absentThresholdMinutes: number;
  excludeWeekends: boolean;
  autoExcludePublicHolidays: boolean;
};

export type GradeLevelItem = {
  id: number;
  name: string;
};

export type TeacherListItem = {
  id: number;
  name: string;
};

export type ClassSessionInfo = {
  id: number;
  classId: number;
  teacherId: number;
  dayOfWeek: string;
};

export type ClassListItem = {
  id: number;
  name: string;
  gradeLevelId: number;
  roomNumber: string;
  studentCount: number;
};

export type UpsertClassPayload = {
  name: string;
  gradeLevelId: number;
  roomNumber?: string;
};

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeProfile(raw?: UserProfileApi): UserProfile {
  return {
    firstName: safeString(raw?.first_name),
    lastName: safeString(raw?.last_name),
    phone: safeString(raw?.phone),
    address: safeString(raw?.address),
    image: safeString(raw?.image),
  };
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await apiRequest<ApiResponse<UserProfileApi>>("/user-profile/show");
  return normalizeProfile(response.data);
}

export async function createUserProfile(): Promise<UserProfile> {
  const response = await apiRequest<ApiResponse<UserProfileApi>>("/user-profile/create", {
    method: "POST",
    body: {},
  });
  return normalizeProfile(response.data);
}

export async function updateUserProfile(payload: {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  imageFile?: File | null;
}) {
  const formData = new FormData();
  formData.append("first_name", payload.firstName);
  formData.append("last_name", payload.lastName);
  formData.append("phone", payload.phone);
  formData.append("address", payload.address);
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  // Laravel cannot parse multipart/form-data on PUT requests.
  // Use POST with _method=PUT (method spoofing) so the image file reaches the server.
  formData.append("_method", "PUT");

  return apiRequestFormData<ApiResponse<UserProfileApi>>("/user-profile/update", {
    method: "POST",
    body: formData,
  });
}

export async function updateCurrentUser(payload: { name: string; password?: string }) {
  const body: Record<string, string> = {
    name: payload.name,
  };

  if (payload.password) {
    body.password = payload.password;
    body.password_confirmation = payload.password;
  }

  return apiRequest<ApiResponse<{ name: string }>>("/auth/update", {
    method: "PUT",
    body,
  });
}

export async function fetchSchoolSettings(): Promise<SchoolSettings> {
  const response = await apiRequest<ApiResponse<Record<string, unknown>>>("/settings/school");
  const data = response.data || {};
  return {
    schoolName: safeString(data.school_name),
    address: safeString(data.address),
    city: safeString(data.city),
    stateProvince: safeString(data.state_province),
    postalCode: safeString(data.postal_code),
    country: safeString(data.country),
    currentAcademicYear: safeString(data.current_academic_year),
    termSemester: safeString(data.term_semester),
  };
}

export async function updateSchoolSettings(payload: SchoolSettings) {
  return apiRequest<ApiResponse<Record<string, unknown>>>("/settings/school", {
    method: "PUT",
    body: {
      school_name: payload.schoolName,
      address: payload.address,
      city: payload.city,
      state_province: payload.stateProvince,
      postal_code: payload.postalCode,
      country: payload.country,
      current_academic_year: payload.currentAcademicYear,
      term_semester: payload.termSemester,
    },
  });
}

export async function fetchAttendanceRules(): Promise<AttendanceRules> {
  const response = await apiRequest<ApiResponse<Record<string, unknown>>>(
    "/settings/attendance-rules",
  );
  const data = response.data || {};
  return {
    lateThresholdMinutes: toNumber(data.late_threshold_minutes) || 15,
    absentThresholdMinutes: toNumber(data.absent_threshold_minutes) || 45,
    excludeWeekends: Boolean(data.exclude_weekends),
    autoExcludePublicHolidays: Boolean(data.auto_exclude_public_holidays),
  };
}

export async function updateAttendanceRules(payload: AttendanceRules) {
  return apiRequest<ApiResponse<Record<string, unknown>>>("/settings/attendance-rules", {
    method: "PUT",
    body: {
      late_threshold_minutes: payload.lateThresholdMinutes,
      absent_threshold_minutes: payload.absentThresholdMinutes,
      exclude_weekends: payload.excludeWeekends,
      auto_exclude_public_holidays: payload.autoExcludePublicHolidays,
    },
  });
}

export async function fetchClassesForSettings(): Promise<ClassListItem[]> {
  const response = await apiRequest<{ list?: { data?: unknown } }>("/classes");
  const data = asArray<ClassApiItem>(response.list?.data);
  return data.map((item) => ({
    id: toNumber(item.id),
    name: safeString(item.name),
    gradeLevelId: toNumber(item.grade_level_id),
    roomNumber: safeString(item.room_number),
    studentCount: asArray(item.students).length,
  }));
}

export async function fetchClassSessionsForSettings(): Promise<ClassSessionInfo[]> {
  const response = await apiRequest<{ list?: { data?: unknown } }>("/class-session");
  const data = asArray<ClassSessionApiItem>(response.list?.data);
  return data.map((item) => ({
    id: toNumber(item.id),
    classId: toNumber(item.class_id),
    teacherId: toNumber(item.teacher_id),
    dayOfWeek: safeString(item.day_of_week),
  }));
}

export async function fetchTeachersForSettings(): Promise<TeacherListItem[]> {
  const response = await apiRequest<ApiResponse<unknown>>("/teachers");
  const data = asArray<TeacherApiItem>(response.data);
  return data.map((teacher) => ({
    id: toNumber(teacher.id),
    name: safeString(teacher.user?.name) || safeString(teacher.teacher_code) || "Teacher",
  }));
}

export async function fetchGradeLevelsForSettings(): Promise<GradeLevelItem[]> {
  const response = await apiRequest<ApiResponse<unknown>>("/grade-levels");
  const data = asArray<GradeLevelApiItem>(response.data);
  return data.map((item) => ({
    id: toNumber(item.id),
    name: safeString(item.name),
  }));
}

export async function createClassForSettings(payload: UpsertClassPayload) {
  return apiRequest<{ data: ClassApiItem; message: string }>("/classes/create", {
    method: "POST",
    body: {
      name: payload.name,
      grade_level_id: payload.gradeLevelId,
      room_number: payload.roomNumber || null,
    },
  });
}

export async function updateClassForSettings(classId: number, payload: UpsertClassPayload) {
  return apiRequest<{ data: ClassApiItem; message: string }>(`/classes/update/${classId}`, {
    method: "PUT",
    body: {
      name: payload.name,
      grade_level_id: payload.gradeLevelId,
      room_number: payload.roomNumber || null,
    },
  });
}

export async function deleteClassForSettings(classId: number) {
  return apiRequest<{ message: string }>(`/classes/${classId}`, {
    method: "DELETE",
  });
}
