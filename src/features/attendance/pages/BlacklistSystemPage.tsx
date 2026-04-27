import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  type AcademicYear,
  type Term,
  fetchAcademicYears,
  fetchTerms,
} from "@features/attendance/api/attendanceApi";
import {
  type BlacklistRow,
  type BlacklistSummary,
  fetchBlacklistOverview,
} from "@features/attendance/api/attendanceAnalyticsApi";

const emptySummary: BlacklistSummary = {
  threshold: 16,
  total_students: 0,
  blacklisted_count: 0,
  warning_count: 0,
  good_standing_count: 0,
};

function statusText(status: BlacklistRow["status"]): string {
  if (status === "blacklisted") {
    return "Blacklisted";
  }
  if (status === "warning") {
    return "Warning";
  }
  return "Good Standing";
}

function statusClass(status: BlacklistRow["status"]): string {
  const base = "inline-flex min-w-28 justify-center rounded px-3 py-1 text-xs font-semibold";
  if (status === "blacklisted") {
    return `${base} bg-red-600 text-white`;
  }
  if (status === "warning") {
    return `${base} bg-amber-500 text-white`;
  }
  return `${base} bg-emerald-600 text-white`;
}

function absenceBadgeClass(absences: number, threshold: number): string {
  if (absences >= threshold) {
    return "rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700";
  }
  if (absences >= Math.max(1, threshold - 2)) {
    return "rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700";
  }
  return "rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700";
}

function exportCsv(rows: BlacklistRow[]) {
  const header = [
    "Roll No",
    "Student Name",
    "Total Absences",
    "Attendance Rate",
    "Status",
  ];

  const lines = rows.map((row) => [
    row.roll_no,
    row.student_name,
    String(row.total_absences),
    `${row.attendance_rate.toFixed(1)}%`,
    statusText(row.status),
  ]);

  const csv = [header, ...lines]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "blacklist-report.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function BlacklistSystemPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [academicYearId, setAcademicYearId] = useState(0);
  const [termId, setTermId] = useState(0);
  const [threshold, setThreshold] = useState(16);
  const [search, setSearch] = useState("");

  const [summary, setSummary] = useState<BlacklistSummary>(emptySummary);
  const [rows, setRows] = useState<BlacklistRow[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsBootstrapping(true);
      try {
        const [yearsData, termsData] = await Promise.all([
          fetchAcademicYears(),
          fetchTerms(),
        ]);

        if (cancelled) {
          return;
        }

        setAcademicYears(yearsData);
        setTerms(termsData);

        const firstYear = yearsData[0]?.id ?? 0;
        setAcademicYearId(firstYear);

        const firstTerm =
          termsData.find((item) => item.academic_year_id === firstYear)?.id ??
          termsData[0]?.id ??
          0;
        setTermId(firstTerm);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load blacklist config.";
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

  const filteredTerms = useMemo(() => {
    if (!academicYearId) {
      return terms;
    }
    return terms.filter((item) => item.academic_year_id === academicYearId);
  }, [terms, academicYearId]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return rows;
    }

    return rows.filter((row) => {
      const name = row.student_name.toLowerCase();
      const rollNo = row.roll_no.toLowerCase();
      return name.includes(keyword) || rollNo.includes(keyword);
    });
  }, [rows, search]);

  useEffect(() => {
    if (!filteredTerms.length) {
      setTermId(0);
      return;
    }

    const termExists = filteredTerms.some((item) => item.id === termId);
    if (!termExists) {
      setTermId(filteredTerms[0].id);
    }
  }, [filteredTerms, termId]);

  useEffect(() => {
    if (!academicYearId || !termId || isBootstrapping) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetchBlacklistOverview({
          academic_year_id: academicYearId,
          term_id: termId,
          threshold,
        });

        setSummary(response.summary);
        setRows(response.rows);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load blacklist.";
        toast.error(message);
        setSummary({ ...emptySummary, threshold });
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [academicYearId, termId, threshold, isBootstrapping]);

  return (
    <main className="min-h-[calc(100vh-120px)] bg-slate-100 pb-10">
      <section className="mx-auto max-w-7xl px-4 py-6">
        <article className="mb-5 rounded border-l-4 border-red-600 bg-red-50 px-6 py-4 text-red-700">
          <p className="text-lg font-semibold">Blacklist Alert System</p>
          <p className="mt-1 text-sm">
            There are{" "}
            <span className="font-bold">{summary.blacklisted_count} students</span> who exceeded
            absence threshold of <span className="font-bold">{summary.threshold} classes</span>.
          </p>
        </article>

        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <span className="font-medium text-slate-600">Absence Threshold</span>
              <input
                type="number"
                min={1}
                max={100}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value || 1))}
                className="h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Search Student</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or Roll No..."
                className="h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-slate-500"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => exportCsv(filteredRows)}
              className="h-10 rounded border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export List
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-3">Roll No</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Total Absences</th>
                  <th className="px-6 py-3">Attendance Rate</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      {isLoading || isBootstrapping
                        ? "Loading blacklist data..."
                        : search.trim()
                          ? "No students match the search keyword."
                          : "No students found for selected filters."}
                    </td>
                  </tr>
                )}
                {filteredRows.map((row) => (
                  <tr key={row.student_id} className="border-t border-slate-200">
                    <td className="px-6 py-3 text-slate-700">{row.roll_no}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{row.student_name}</td>
                    <td className="px-6 py-3">
                      <span className={absenceBadgeClass(row.total_absences, summary.threshold)}>
                        {row.total_absences}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{row.attendance_rate.toFixed(1)}%</td>
                    <td className="px-6 py-3">
                      <span className={statusClass(row.status)}>{statusText(row.status)}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-slate-500">
                      View Details
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
