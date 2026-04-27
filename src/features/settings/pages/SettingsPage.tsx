import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  type AttendanceRules,
  type ClassListItem,
  type ClassSessionInfo,
  type GradeLevelItem,
  type SchoolSettings,
  type TeacherListItem,
  createClassForSettings,
  deleteClassForSettings,
  fetchAttendanceRules,
  fetchClassesForSettings,
  fetchClassSessionsForSettings,
  fetchGradeLevelsForSettings,
  fetchSchoolSettings,
  fetchTeachersForSettings,
  updateAttendanceRules,
  updateClassForSettings,
  updateSchoolSettings,
} from "@features/settings/api/settingsApi";
import { HttpError } from "@shared/api/http";

type TabKey = "school" | "class" | "rules";

type ClassForm = {
  name: string;
  gradeLevelId: number;
  roomNumber: string;
};

const dayAbbrev: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const defaultSchoolSettings: SchoolSettings = {
  schoolName: "",
  address: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  country: "",
  currentAcademicYear: "",
  termSemester: "",
};

const defaultAttendanceRules: AttendanceRules = {
  lateThresholdMinutes: 15,
  absentThresholdMinutes: 45,
  excludeWeekends: true,
  autoExcludePublicHolidays: true,
};

const emptyClassForm: ClassForm = {
  name: "",
  gradeLevelId: 0,
  roomNumber: "",
};

function sortDays(days: string[]): string[] {
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function settingsTabClass(isActive: boolean): string {
  return [
    "relative py-3 text-sm font-medium transition",
    isActive
      ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-indigo-500"
      : "text-slate-500 hover:text-slate-700",
  ].join(" ");
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("school");
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(defaultSchoolSettings);
  const [attendanceRules, setAttendanceRules] = useState<AttendanceRules>(defaultAttendanceRules);
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [sessions, setSessions] = useState<ClassSessionInfo[]>([]);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevelItem[]>([]);

  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [isSavingClass, setIsSavingClass] = useState(false);
  const [isDeletingClassId, setIsDeletingClassId] = useState<number | null>(null);

  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState<ClassForm>(emptyClassForm);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsBootstrapping(true);
      try {
        const [schoolData, rulesData, classData, sessionData, gradeData] = await Promise.all([
          fetchSchoolSettings(),
          fetchAttendanceRules(),
          fetchClassesForSettings(),
          fetchClassSessionsForSettings(),
          fetchGradeLevelsForSettings(),
        ]);

        let teacherData: TeacherListItem[] = [];
        try {
          teacherData = await fetchTeachersForSettings();
        } catch (error) {
          if (error instanceof HttpError && error.status === 403) {
            teacherData = [];
            toast.error("Teacher list is limited for this account role.");
          } else {
            throw error;
          }
        }

        if (cancelled) {
          return;
        }

        setSchoolSettings(schoolData);
        setAttendanceRules(rulesData);
        setClasses(classData);
        setSessions(sessionData);
        setTeachers(teacherData);
        setGradeLevels(gradeData);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load settings.";
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

  const teacherMap = useMemo(() => {
    return new Map(teachers.map((teacher) => [teacher.id, teacher.name]));
  }, [teachers]);

  const classSummaryRows = useMemo(() => {
    return classes.map((item) => {
      const relatedSessions = sessions.filter((session) => session.classId === item.id);
      const firstTeacher = relatedSessions[0]?.teacherId ?? 0;
      const teacherName = teacherMap.get(firstTeacher) || "Not assigned";
      const dayLabels = sortDays(
        [...new Set(relatedSessions.map((session) => dayAbbrev[session.dayOfWeek] || session.dayOfWeek))].filter(
          Boolean,
        ),
      );

      return {
        ...item,
        teacherName,
        dayText: dayLabels.length ? dayLabels.join(", ") : "No schedule",
      };
    });
  }, [classes, sessions, teacherMap]);

  const openCreateModal = () => {
    setEditingClassId(null);
    setClassForm({
      ...emptyClassForm,
      gradeLevelId: gradeLevels[0]?.id ?? 0,
    });
    setIsClassModalOpen(true);
  };

  const openEditModal = (item: ClassListItem) => {
    setEditingClassId(item.id);
    setClassForm({
      name: item.name,
      gradeLevelId: item.gradeLevelId,
      roomNumber: item.roomNumber,
    });
    setIsClassModalOpen(true);
  };

  const closeClassModal = () => {
    if (isSavingClass) {
      return;
    }
    setIsClassModalOpen(false);
    setEditingClassId(null);
  };

  const reloadClasses = async () => {
    const [classData, sessionData] = await Promise.all([
      fetchClassesForSettings(),
      fetchClassSessionsForSettings(),
    ]);
    setClasses(classData);
    setSessions(sessionData);
  };

  const handleSaveSchool = async () => {
    setIsSavingSchool(true);
    try {
      await updateSchoolSettings(schoolSettings);
      toast.success("School settings saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save school settings.";
      toast.error(message);
    } finally {
      setIsSavingSchool(false);
    }
  };

  const handleSaveRules = async () => {
    setIsSavingRules(true);
    try {
      await updateAttendanceRules(attendanceRules);
      toast.success("Attendance rules saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save attendance rules.";
      toast.error(message);
    } finally {
      setIsSavingRules(false);
    }
  };

  const handleSaveClass = async () => {
    if (!classForm.name.trim() || !classForm.gradeLevelId) {
      toast.error("Class name and grade level are required.");
      return;
    }

    setIsSavingClass(true);
    try {
      if (editingClassId) {
        await updateClassForSettings(editingClassId, {
          name: classForm.name.trim(),
          gradeLevelId: classForm.gradeLevelId,
          roomNumber: classForm.roomNumber.trim(),
        });
        toast.success("Class updated.");
      } else {
        await createClassForSettings({
          name: classForm.name.trim(),
          gradeLevelId: classForm.gradeLevelId,
          roomNumber: classForm.roomNumber.trim(),
        });
        toast.success("Class created.");
      }

      await reloadClasses();
      setIsClassModalOpen(false);
      setEditingClassId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save class.";
      toast.error(message);
    } finally {
      setIsSavingClass(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    setIsDeletingClassId(classId);
    try {
      await deleteClassForSettings(classId);
      await reloadClasses();
      toast.success("Class deleted.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete class.";
      toast.error(message);
    } finally {
      setIsDeletingClassId(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-slate-100 pb-10">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 border-b border-slate-200">
          <div className="flex items-center gap-10">
            <button
              type="button"
              onClick={() => setActiveTab("school")}
              className={settingsTabClass(activeTab === "school")}
            >
              School Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("class")}
              className={settingsTabClass(activeTab === "class")}
            >
              Class Management
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={settingsTabClass(activeTab === "rules")}
            >
              Attendance Rules
            </button>
          </div>
        </div>

        {activeTab === "school" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-7 py-6">
              <h2 className="text-3xl font-semibold text-slate-800">School Details</h2>
              <p className="mt-2 text-sm text-slate-500">
                Manage your institution&apos;s profile and academic year settings.
              </p>
            </div>

            <div className="px-7 py-6">
              <div className="grid gap-5">
                <label className="space-y-2">
                  <span className="text-sm text-slate-700">School Name</span>
                  <input
                    type="text"
                    value={schoolSettings.schoolName}
                    onChange={(event) =>
                      setSchoolSettings((current) => ({
                        ...current,
                        schoolName: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-slate-700">Address</span>
                  <input
                    type="text"
                    value={schoolSettings.address}
                    onChange={(event) =>
                      setSchoolSettings((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-700">City</span>
                    <input
                      type="text"
                      value={schoolSettings.city}
                      onChange={(event) =>
                        setSchoolSettings((current) => ({
                          ...current,
                          city: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-700">State/Province</span>
                    <input
                      type="text"
                      value={schoolSettings.stateProvince}
                      onChange={(event) =>
                        setSchoolSettings((current) => ({
                          ...current,
                          stateProvince: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-700">Postal Code</span>
                    <input
                      type="text"
                      value={schoolSettings.postalCode}
                      onChange={(event) =>
                        setSchoolSettings((current) => ({
                          ...current,
                          postalCode: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-700">Country</span>
                    <input
                      type="text"
                      value={schoolSettings.country}
                      onChange={(event) =>
                        setSchoolSettings((current) => ({
                          ...current,
                          country: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                    />
                  </label>
                </div>

                <div className="mt-2 border-t border-slate-200 pt-6">
                  <p className="mb-4 text-base font-medium text-slate-800">
                    Academic Year Configuration
                  </p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm text-slate-700">Current Academic Year</span>
                      <input
                        type="text"
                        value={schoolSettings.currentAcademicYear}
                        onChange={(event) =>
                          setSchoolSettings((current) => ({
                            ...current,
                            currentAcademicYear: event.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-slate-700">Term / Semester</span>
                      <input
                        type="text"
                        value={schoolSettings.termSemester}
                        onChange={(event) =>
                          setSchoolSettings((current) => ({
                            ...current,
                            termSemester: event.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-7 py-4">
              <button
                type="button"
                onClick={handleSaveSchool}
                disabled={isSavingSchool || isBootstrapping}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingSchool ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        )}

        {activeTab === "class" && (
          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold text-slate-800">Classes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage classes, sections, and schedules.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <span className="text-lg">+</span>
                Add Class
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {classSummaryRows.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 last:border-b-0"
                >
                  <div>
                    <p className="text-base font-semibold text-indigo-600">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Teacher: <span className="ml-1">{item.teacherName}</span>
                      <span className="ml-6">{item.dayText}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {item.studentCount} Students
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      aria-label="Edit class"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClass(item.id)}
                      disabled={isDeletingClassId === item.id}
                      className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete class"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
              {classSummaryRows.length === 0 && !isBootstrapping && (
                <div className="px-6 py-10 text-center text-slate-500">No classes available.</div>
              )}
            </div>
          </section>
        )}

        {activeTab === "rules" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-7 py-6">
              <h2 className="text-3xl font-semibold text-slate-800">Attendance Rules</h2>
              <p className="mt-2 text-sm text-slate-500">
                Configure how attendance is calculated and reported.
              </p>
            </div>

            <div className="space-y-7 px-7 py-6">
              <div>
                <p className="mb-3 text-base font-medium text-slate-800">Time Thresholds</p>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-700">Late Threshold (minutes)</span>
                    <input
                      type="number"
                      min={1}
                      value={attendanceRules.lateThresholdMinutes}
                      onChange={(event) =>
                        setAttendanceRules((current) => ({
                          ...current,
                          lateThresholdMinutes: Number(event.target.value || 1),
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                    />
                    <p className="text-sm text-slate-500">
                      Students arriving after this time are marked Late.
                    </p>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-700">Absent Threshold (minutes)</span>
                    <input
                      type="number"
                      min={1}
                      value={attendanceRules.absentThresholdMinutes}
                      onChange={(event) =>
                        setAttendanceRules((current) => ({
                          ...current,
                          absentThresholdMinutes: Number(event.target.value || 1),
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base outline-none focus:border-indigo-400"
                    />
                    <p className="text-sm text-slate-500">
                      Students arriving after this time are marked Absent.
                    </p>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <p className="mb-4 text-base font-medium text-slate-800">Calculation Settings</p>
                <label className="mb-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={attendanceRules.excludeWeekends}
                    onChange={(event) =>
                      setAttendanceRules((current) => ({
                        ...current,
                        excludeWeekends: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>
                    <p className="text-sm text-slate-800">Exclude Weekends</p>
                    <p className="text-sm text-slate-500">
                      Do not count Saturday and Sunday in attendance calculations.
                    </p>
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={attendanceRules.autoExcludePublicHolidays}
                    onChange={(event) =>
                      setAttendanceRules((current) => ({
                        ...current,
                        autoExcludePublicHolidays: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>
                    <p className="text-sm text-slate-800">Auto-exclude Public Holidays</p>
                    <p className="text-sm text-slate-500">
                      Automatically skip dates marked as public holidays in the calendar.
                    </p>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-7 py-4">
              <button
                type="button"
                onClick={handleSaveRules}
                disabled={isSavingRules || isBootstrapping}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingRules ? "Saving..." : "Save Rules"}
              </button>
            </div>
          </section>
        )}
      </section>

      {isClassModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-800">
              {editingClassId ? "Edit Class" : "Add Class"}
            </h3>
            <div className="mt-4 space-y-4">
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Class Name</span>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(event) =>
                    setClassForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Grade Level</span>
                <select
                  value={classForm.gradeLevelId || ""}
                  onChange={(event) =>
                    setClassForm((current) => ({
                      ...current,
                      gradeLevelId: Number(event.target.value),
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-400"
                >
                  <option value="">Select grade level</option>
                  {gradeLevels.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Room Number</span>
                <input
                  type="text"
                  value={classForm.roomNumber}
                  onChange={(event) =>
                    setClassForm((current) => ({
                      ...current,
                      roomNumber: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeClassModal}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveClass}
                disabled={isSavingClass}
                className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingClass ? "Saving..." : editingClassId ? "Update Class" : "Create Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

