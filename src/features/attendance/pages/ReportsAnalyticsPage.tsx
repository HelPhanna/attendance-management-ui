import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  type AcademicYear,
  type ClassItem,
  type Term,
  fetchAcademicYears,
  fetchClasses,
  fetchTerms,
} from "@features/attendance/api/attendanceApi";
import {
  type DailyAttendanceRow,
  type ReportSummary,
  exportAttendanceAnalytics,
  fetchReportSummary,
} from "@features/attendance/api/attendanceAnalyticsApi";

function todayDateValue(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const emptySummary: ReportSummary = {
  classes_held: 0,
  avg_attendance: 0,
  total_present: 0,
  total_absent: 0,
  total_permission: 0,
};

export default function ReportsAnalyticsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [dateFrom, setDateFrom] = useState(todayDateValue());
  const [dateTo, setDateTo] = useState(todayDateValue());
  const [academicYearId, setAcademicYearId] = useState(0);
  const [termId, setTermId] = useState(0);
  const [classId, setClassId] = useState(0);

  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [rows, setRows] = useState<DailyAttendanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState<null | "pdf" | "xlsx">(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsLoading(true);
      try {
        const [yearsData, termsData, classesData] = await Promise.all([
          fetchAcademicYears(),
          fetchTerms(),
          fetchClasses(),
        ]);

        if (cancelled) {
          return;
        }

        setAcademicYears(yearsData);
        setTerms(termsData);
        setClasses(classesData);

        const now = new Date();
        const defaultDateTo = now.toISOString().split("T")[0];
        const defaultDateFrom = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        setDateFrom(defaultDateFrom);
        setDateTo(defaultDateTo);

        const firstYearId = yearsData[0]?.id ?? 0;
        setAcademicYearId(firstYearId);

        const firstTermId =
          termsData.find((item) => item.academic_year_id === firstYearId)?.id ??
          termsData[0]?.id ??
          0;
        setTermId(firstTermId);

        setClassId(classesData[0]?.id ?? 0);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load report config.";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTerms = useMemo(() => {
    if (!academicYearId) {
      return terms;
    }
    return terms.filter((item) => item.academic_year_id === academicYearId);
  }, [terms, academicYearId]);

  useEffect(() => {
    if (!filteredTerms.length) {
      setTermId(0);
      return;
    }

    const hasTerm = filteredTerms.some((item) => item.id === termId);
    if (!hasTerm) {
      setTermId(filteredTerms[0].id);
    }
  }, [filteredTerms, termId]);

  const runGenerateReport = async () => {
    if (!dateFrom || !dateTo || !academicYearId || !termId || !classId) {
      toast.error("Please complete all report filters.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetchReportSummary({
        date_from: dateFrom,
        date_to: dateTo,
        academic_year_id: academicYearId,
        term_id: termId,
        class_id: classId,
      });

      setSummary(response.summary);
      setRows(response.daily);
      toast.success("Report generated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Report generation failed.";
      toast.error(message);
      setSummary(emptySummary);
      setRows([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    if (!dateFrom || !dateTo || !academicYearId || !termId || !classId) {
      toast.error("Please complete all report filters.");
      return;
    }

    setIsExporting(format);
    try {
      await exportAttendanceAnalytics(format, {
        date_from: dateFrom,
        date_to: dateTo,
        academic_year_id: academicYearId,
        term_id: termId,
        class_id: classId,
      });
      toast.success(`${format.toUpperCase()} exported successfully.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed.";
      toast.error(message);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-slate-100 pb-10">
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-slate-800">Report Configuration</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Start Date</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">End Date</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Academic Year</span>
              <select
                value={academicYearId || ""}
                onChange={(event) => setAcademicYearId(Number(event.target.value))}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 outline-none focus:border-slate-500"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Term</span>
              <select
                value={termId || ""}
                onChange={(event) => setTermId(Number(event.target.value))}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 outline-none focus:border-slate-500"
              >
                <option value="">Select Term</option>
                {filteredTerms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Class</span>
              <select
                value={classId || ""}
                onChange={(event) => setClassId(Number(event.target.value))}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 outline-none focus:border-slate-500"
              >
                <option value="">Select Class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={runGenerateReport}
              disabled={isLoading || isGenerating}
              className="h-11 rounded bg-slate-800 px-6 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Classes Held</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{summary.classes_held}</p>
          </article>
          <article className="rounded border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Avg. Attendance</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{summary.avg_attendance}%</p>
          </article>
          <article className="rounded border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total Present</p>
            <p className="mt-2 text-4xl font-bold text-emerald-600">{summary.total_present}</p>
          </article>
          <article className="rounded border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total Absent</p>
            <p className="mt-2 text-4xl font-bold text-red-600">{summary.total_absent}</p>
          </article>
          <article className="rounded border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total Permission</p>
            <p className="mt-2 text-4xl font-bold text-blue-600">{summary.total_permission}</p>
          </article>
        </div>

        <div className="mt-6 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-xl font-semibold text-slate-800">Daily Attendance Summary</h3>
            <p className="text-sm text-slate-500">Last {rows.length || 0} Days</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3">Present</th>
                  <th className="px-6 py-3">Absent</th>
                  <th className="px-6 py-3">Permission</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      {isGenerating ? "Loading report..." : "No report rows for selected filters."}
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={`${row.date}-${row.class_name}`} className="border-t border-slate-200">
                    <td className="px-6 py-3 font-medium text-slate-700">{formatDateLabel(row.date)}</td>
                    <td className="px-6 py-3 text-slate-600">{row.class_name}</td>
                    <td className="px-6 py-3 text-slate-700">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {row.present}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                        {row.absent}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {row.permission}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-700">
                      {row.rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleExport("xlsx")}
            disabled={isExporting !== null}
            className="h-10 rounded border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting === "xlsx" ? "Exporting..." : "Export Excel"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={isExporting !== null}
            className="h-10 rounded border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </section>
    </main>
  );
}
