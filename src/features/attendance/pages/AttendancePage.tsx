import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  type ClassItem,
  type ClassSession,
  type TeacherItem,
  type Term,
  exportAttendanceReport,
  fetchClasses,
  fetchClassSessions,
  fetchTeachers,
  fetchTeachersFallbackFromSessions,
  fetchTerms,
  filterAttendance,
  saveAttendanceRecords,
} from "@features/attendance/api/attendanceApi";
import { HttpError } from "@shared/api/http";

type AttendanceStatus = "present" | "absent" | "permission" | null;

type AttendanceRow = {
  studentId: number;
  rollNo: string;
  name: string;
  status: AttendanceStatus;
  comment: string;
};

type SessionOption = {
  key: string;
  classId: number;
  teacherId: number;
  termId: number;
  startTime: string;
  endTime: string;
  label: string;
};

function todayDateValue(): string {
  return new Date().toISOString().split("T")[0];
}

function toDisplayDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeToHM(raw: string): string {
  const [hour, minute] = raw.split(":");
  const h = Number(hour);
  const m = Number(minute);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return raw;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function normalizeTimeToHIS(raw: string): string {
  const value = raw.trim();
  const match = value.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (!match) {
    return value;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? "0");

  if ([hour, minute, second].some((part) => Number.isNaN(part))) {
    return value;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function makeSessionOptions(
  sessions: ClassSession[],
  classes: ClassItem[],
): SessionOption[] {
  const classNameMap = new Map(classes.map((item) => [item.id, item.name]));

  return sessions.map((session) => {
    const className =
      classNameMap.get(session.class_id) || `Class #${session.class_id}`;
    const start = formatTimeToHM(session.start_time);
    const end = formatTimeToHM(session.end_time);
    const normalizedStart = normalizeTimeToHIS(session.start_time);
    const normalizedEnd = normalizeTimeToHIS(session.end_time);

    return {
      key: `${session.class_id}-${session.term_id}-${session.teacher_id}-${start}-${end}`,
      classId: session.class_id,
      teacherId: session.teacher_id,
      termId: session.term_id,
      startTime: normalizedStart,
      endTime: normalizedEnd,
      label: `${className} (${start}-${end})`,
    };
  });
}

function statusButtonClass(
  status: AttendanceStatus,
  active: AttendanceStatus,
): string {
  const base =
    "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition";

  if (status !== active) {
    return `${base} border-slate-300 bg-white text-slate-400 hover:border-slate-400`;
  }

  if (status === "present") {
    return `${base} border-emerald-600 bg-emerald-600 text-white`;
  }

  if (status === "absent") {
    return `${base} border-red-600 bg-red-600 text-white`;
  }

  return `${base} border-blue-600 bg-blue-600 text-white`;
}

export default function AttendancePage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const [date, setDate] = useState(todayDateValue());
  const [termId, setTermId] = useState<number>(0);
  const [sessionKey, setSessionKey] = useState("");
  const [teacherId, setTeacherId] = useState<number>(0);

  const [searched, setSearched] = useState(false);
  const [classSessionId, setClassSessionId] = useState<number | null>(null);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState<null | "pdf" | "xlsx">(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsBootstrapping(true);
      try {
        const [termsData, classesData, sessionsData] = await Promise.all([
          fetchTerms(),
          fetchClasses(),
          fetchClassSessions(),
        ]);

        let teachersData: TeacherItem[] = [];

        try {
          teachersData = await fetchTeachers();
        } catch (error) {
          teachersData = await fetchTeachersFallbackFromSessions(sessionsData);
          if (error instanceof HttpError && error.status === 403) {
            toast.error("Teacher list is limited for this account role.");
          }
        }

        if (!cancelled) {
          setTerms(termsData);
          setClasses(classesData);
          setSessions(sessionsData);
          setTeachers(teachersData);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load attendance data.";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const sessionOptions = useMemo(
    () => makeSessionOptions(sessions, classes),
    [sessions, classes],
  );

  const filteredSessionOptions = useMemo(() => {
    return sessionOptions.filter((option) => {
      const termOk = termId ? option.termId === termId : true;
      const teacherOk = teacherId ? option.teacherId === teacherId : true;
      return termOk && teacherOk;
    });
  }, [sessionOptions, termId, teacherId]);

  const selectedSession = useMemo(
    () => sessionOptions.find((option) => option.key === sessionKey) || null,
    [sessionKey, sessionOptions],
  );

  const statCounts = useMemo(() => {
    const present = rows.filter((row) => row.status === "present").length;
    const absent = rows.filter((row) => row.status === "absent").length;
    const permission = rows.filter((row) => row.status === "permission").length;
    const total = rows.length;
    const average = total > 0 ? (present / total) * 100 : 0;

    return { present, absent, permission, total, average };
  }, [rows]);

  const loadAttendanceByCriteria = async (showSuccessToast = true) => {
    if (!date || !termId || !teacherId || !selectedSession) {
      toast.error("Please fill all required filter fields.");
      return false;
    }

    setIsSearching(true);
    try {
      const startTime = normalizeTimeToHIS(selectedSession.startTime);
      const endTime = normalizeTimeToHIS(selectedSession.endTime);

      const response = await filterAttendance({
        date,
        term_id: termId,
        class_id: selectedSession.classId,
        teacher_id: teacherId,
        start_time: startTime,
        end_time: endTime,
      });

      const mappedRows = response.students.map((item) => {
        return {
          studentId: item.student_id,
          rollNo:
            item.student_code ||
            `STU-${String(item.student_id).padStart(3, "0")}`,
          name: item.name || `Student #${item.student_id}`,
          status: item.status,
          comment: item.comment || "",
        };
      });

      setRows(mappedRows);
      setClassSessionId(response.class_session_id || null);
      setIsDirty(false);
      setSearched(true);
      if (showSuccessToast) {
        toast.success("Attendance records loaded.");
      }
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to filter attendance.";
      toast.error(message);
      setRows([]);
      setClassSessionId(null);
      setSearched(true);
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    await loadAttendanceByCriteria(true);
  };

  const setStatus = (
    index: number,
    nextStatus: Exclude<AttendanceStatus, null>,
  ) => {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        return {
          ...row,
          status: row.status === nextStatus ? null : nextStatus,
        };
      }),
    );
    setIsDirty(true);
  };

  const setComment = (index: number, comment: string) => {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }
        return { ...row, comment };
      }),
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!classSessionId) {
      toast.error("Search attendance records before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await saveAttendanceRecords({
        class_session_id: classSessionId,
        records: rows.map((row) => ({
          student_id: row.studentId,
          status: row.status,
          comment: row.comment.trim() || null,
        })),
      });
      setIsDirty(false);
      toast.success("Attendance saved successfully.");
      await loadAttendanceByCriteria(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    if (!selectedSession || !termId || !teacherId || !date) {
      toast.error("Please select filter criteria before exporting.");
      return;
    }

    setIsExporting(format);
    try {
      const startTime = normalizeTimeToHIS(selectedSession.startTime);
      const endTime = normalizeTimeToHIS(selectedSession.endTime);

      await exportAttendanceReport(format, {
        date,
        term_id: termId,
        class_id: selectedSession.classId,
        teacher_id: teacherId,
        class_session_id: classSessionId ?? undefined,
        start_time: startTime,
        end_time: endTime,
      });
      toast.success(`Exported ${format.toUpperCase()} report.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed.";
      toast.error(message);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-slate-100 pb-8">
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 border-l-4 border-slate-700 pl-3 text-xl font-semibold text-slate-700">
            Search / Filter Criteria
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-slate-600">
                Date Selection *
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-11 w-full rounded border border-slate-300 px-3 text-base outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-slate-600">Term Name *</span>
              <select
                value={termId || ""}
                onChange={(event) => setTermId(Number(event.target.value))}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-base outline-none focus:border-slate-500"
              >
                <option value="">Select Term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-slate-600">Class Name *</span>
              <select
                value={sessionKey}
                onChange={(event) => setSessionKey(event.target.value)}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-base outline-none focus:border-slate-500"
              >
                <option value="">Select Class Time</option>
                {filteredSessionOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-slate-600">
                Teacher Name *
              </span>
              <select
                value={teacherId || ""}
                onChange={(event) => setTeacherId(Number(event.target.value))}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-base outline-none focus:border-slate-500"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || isBootstrapping}
              className="inline-flex h-11 min-w-56 items-center justify-center rounded bg-slate-800 px-6 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSearching ? "Searching..." : "Search Records"}
            </button>
          </div>
        </div>

        {!searched && (
          <div className="rounded border border-slate-200 bg-white py-28 text-center text-lg text-slate-500">
            Select search criteria and click "Search Records" to load
            attendance.
          </div>
        )}

        {searched && (
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="border-l-4 border-slate-700 pl-3 text-3xl font-semibold text-slate-800">
                Daily Attendance Register{" "}
                <span className="ml-2 text-xl font-normal text-slate-500">
                  | {toDisplayDate(date)}
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-10 rounded border border-slate-300 bg-white px-6 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("xlsx")}
                  disabled={isExporting !== null}
                  className="h-10 rounded border border-slate-300 bg-white px-6 font-medium text-slate-700 hover:bg-slate-50"
                >
                  {isExporting === "xlsx" ? "Exporting..." : "Export Excel"}
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting !== null}
                  className="h-10 rounded border border-slate-300 bg-white px-6 font-medium text-slate-700 hover:bg-slate-50"
                >
                  {isExporting === "pdf" ? "Exporting..." : "Export PDF"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    !classSessionId || !rows.length || !isDirty || isSaving
                  }
                  className="h-10 rounded bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSaving ? "Saving..." : "Save Records"}
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="w-24 px-6 py-4">Roll No.</th>
                    <th className="w-80 px-6 py-4">Student Name</th>
                    <th className="w-32 bg-emerald-900 px-6 py-4 text-center">
                      Presence
                    </th>
                    <th className="w-32 bg-red-900 px-6 py-4 text-center">
                      Absence
                    </th>
                    <th className="w-32 bg-indigo-900 px-6 py-4 text-center">
                      Permission
                    </th>
                    <th className="px-6 py-4">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.studentId}
                      className="border-t border-slate-200"
                    >
                      <td className="px-6 py-4 text-slate-700">{row.rollNo}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {row.name}
                      </td>
                      <td className="bg-emerald-50 px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setStatus(index, "present")}
                          className={statusButtonClass("present", row.status)}
                        >
                          {row.status === "present" ? "✓" : "·"}
                        </button>
                      </td>
                      <td className="bg-red-50 px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setStatus(index, "absent")}
                          className={statusButtonClass("absent", row.status)}
                        >
                          {row.status === "absent" ? "✕" : "·"}
                        </button>
                      </td>
                      <td className="bg-indigo-50 px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setStatus(index, "permission")}
                          className={statusButtonClass(
                            "permission",
                            row.status,
                          )}
                        >
                          {row.status === "permission" ? "↻" : "·"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={row.comment}
                          onChange={(event) =>
                            setComment(index, event.target.value)
                          }
                          placeholder="Add note..."
                          className="w-full border-b border-slate-300 bg-transparent px-1 py-1.5 text-slate-700 outline-none focus:border-slate-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-slate-600">
                <p>Showing {rows.length} students</p>
                <p className="flex items-center gap-5">
                  <span className="text-emerald-700">
                    Present: {statCounts.present}
                  </span>
                  <span className="text-red-600">
                    Absent: {statCounts.absent}
                  </span>
                  <span className="text-blue-600">
                    Permission: {statCounts.permission}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded border border-slate-300 bg-white p-5 shadow-sm">
                <p className="text-lg font-semibold text-slate-500">
                  Total Students
                </p>
                <p className="mt-2 text-5xl font-bold text-slate-900">
                  {statCounts.total}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Registered in selected class
                </p>
              </article>
              <article className="rounded border border-slate-300 bg-white p-5 shadow-sm">
                <p className="text-lg font-semibold text-slate-500">
                  Average Attendance
                </p>
                <p className="mt-2 text-5xl font-bold text-slate-900">
                  {statCounts.average.toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-emerald-600">
                  Based on current selected class record
                </p>
              </article>
              <article className="rounded border border-slate-300 bg-white p-5 shadow-sm">
                <p className="text-lg font-semibold text-slate-500">
                  Pending Excuses
                </p>
                <p className="mt-2 text-5xl font-bold text-slate-900">
                  {statCounts.permission}
                </p>
                <p className="mt-2 text-sm text-amber-600">
                  Requires verification
                </p>
              </article>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
