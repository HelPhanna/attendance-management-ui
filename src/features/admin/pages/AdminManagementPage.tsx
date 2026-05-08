import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSession } from "@shared/auth/session";
import { hasAdminAccess, hasSuperAdminAccess } from "@shared/auth/roles";
import {
  fetchUsersWithRoles,
  fetchAllRoles,
  updateUserRoles,
  deleteUser,
  fetchAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  fetchTerms,
  createTerm,
  updateTerm,
  deleteTerm,
  fetchEnrollments,
  fetchStudents,
  fetchClassesForAdmin,
  createEnrollment,
  deleteEnrollment,
  fetchClassSessions,
  fetchTeachersForAdmin,
  fetchSubjects,
  createClassSession,
  deleteClassSession,
  type UserWithRoles,
  type Role,
  type AcademicYear,
  type Term,
  type EnrollmentItem,
  type Student,
  type ClassItem,
  type TeacherItem,
  type ClassSessionItem,
  type SubjectItem,
} from "@features/admin/api/adminApi";
import { HttpError } from "@shared/api/http";

// ─── Permission Guard ─────────────────────────────────────────────────────

function useIsAdmin(): boolean {
  const session = getSession();
  return hasAdminAccess(session?.user);
}

function useIsSuperAdmin(): boolean {
  const session = getSession();
  return hasSuperAdminAccess(session?.user);
}

// ─── Tab types ────────────────────────────────────────────────────────────

type AdminTab = "users" | "enrollments" | "academic" | "terms" | "sessions";

// ─── Small UI helpers ─────────────────────────────────────────────────────

function TabBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const selectCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white";

function SaveBtn({
  loading,
  label = "Save",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

function DeleteBtn({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition-colors"
      title="Delete"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
      </svg>
    </button>
  );
}

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
      title="Edit"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </svg>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-sm text-slate-400">
      <svg
        viewBox="0 0 24 24"
        className="mx-auto mb-3 h-8 w-8 text-slate-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
      </svg>
      {message}
    </div>
  );
}

// ─── Role color map ───────────────────────────────────────────────────────

function roleColor(name: string): string {
  if (name === "super_admin") return "bg-purple-100 text-purple-700";
  if (name === "admin") return "bg-indigo-100 text-indigo-700";
  if (name === "teacher") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-600";
}

// ─── Tab: Users & Roles ───────────────────────────────────────────────────

function UsersTab({
  roles,
  isSuperAdmin,
}: {
  roles: Role[];
  isSuperAdmin: boolean;
}) {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserWithRoles | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserWithRoles | null>(
    null,
  );

  async function load() {
    setLoading(true);
    try {
      const data = await fetchUsersWithRoles();
      setUsers(data);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openEdit(u: UserWithRoles) {
    setEditUser(u);
    setSelectedRoleIds(u.roles.map((r) => r.id));
  }

  async function handleSaveRoles(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      await updateUserRoles(editUser.id, selectedRoleIds);
      toast.success("Roles updated.");
      setEditUser(null);
      load();
    } catch (err) {
      const msg =
        err instanceof HttpError
          ? String((err.payload as any)?.message ?? err.message)
          : "Failed to update.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(u: UserWithRoles) {
    setDeletingId(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((user) => user.id !== u.id));
      toast.success(`User "${u.name}" deleted successfully.`);
    } catch (err) {
      const msg =
        err instanceof HttpError
          ? String((err.payload as any)?.message ?? err.message)
          : "Failed to delete user.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
      setDeleteTargetUser(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-400">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">
          Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-4 px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-wrap gap-1 justify-end">
                  {u.roles.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      No roles
                    </span>
                  ) : (
                    u.roles.map((r) => (
                      <Badge
                        key={r.id}
                        label={r.name}
                        color={roleColor(r.name)}
                      />
                    ))
                  )}
                </div>
                <EditBtn onClick={() => openEdit(u)} />
                {isSuperAdmin && (
                  <DeleteBtn
                    loading={deletingId === u.id}
                    onClick={() => setDeleteTargetUser(u)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTargetUser && (
        <Modal
          title="Delete User"
          onClose={() => {
            if (deletingId) return;
            setDeleteTargetUser(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Delete user{" "}
              <span className="font-semibold text-slate-900">
                {deleteTargetUser.name}
              </span>{" "}
              ({deleteTargetUser.email})?
            </p>
            <p className="text-sm text-red-600">This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                disabled={deletingId !== null}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteTargetUser)}
                disabled={deletingId !== null}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === deleteTargetUser.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editUser && (
        <Modal
          title={`Edit Roles — ${editUser.name}`}
          onClose={() => setEditUser(null)}
        >
          <form onSubmit={handleSaveRoles} className="space-y-4">
            <p className="text-sm text-slate-500">{editUser.email}</p>
            <Field label="Assign Roles" required>
              <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                {roles.length === 0 ? (
                  <p className="text-sm text-slate-400">No roles available.</p>
                ) : (
                  roles.map((r) => (
                    <label
                      key={r.id}
                      className="flex cursor-pointer items-center gap-2.5"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedRoleIds.includes(r.id)}
                        onChange={(e) =>
                          setSelectedRoleIds((prev) =>
                            e.target.checked
                              ? [...prev, r.id]
                              : prev.filter((id) => id !== r.id),
                          )
                        }
                      />
                      <span className="text-sm text-slate-700">{r.name}</span>
                      <Badge label={r.name} color={roleColor(r.name)} />
                    </label>
                  ))
                )}
              </div>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <SaveBtn loading={saving} label="Update Roles" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Academic Years ──────────────────────────────────────────────────

function AcademicYearsTab() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<AcademicYear | null>(null);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      setYears(await fetchAcademicYears());
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditItem(null);
    setForm({ name: "", start_date: "", end_date: "" });
    setShowModal(true);
  }

  function openEdit(y: AcademicYear) {
    setEditItem(y);
    setForm({ name: y.name, start_date: y.start_date, end_date: y.end_date });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await updateAcademicYear(editItem.id, form);
        toast.success("Academic year updated.");
      } else {
        await createAcademicYear(form);
        toast.success("Academic year created.");
      }
      setShowModal(false);
      load();
    } catch (err) {
      const msg =
        err instanceof HttpError
          ? String((err.payload as any)?.message ?? err.message)
          : "Failed to save.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this academic year?")) return;
    setDeletingId(id);
    try {
      await deleteAcademicYear(id);
      toast.success("Deleted.");
      load();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Academic Year
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading…</div>
      ) : years.length === 0 ? (
        <EmptyState message="No academic years yet. Create one to get started." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
          {years.map((y) => (
            <div
              key={y.id}
              className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{y.name}</p>
                <p className="text-xs text-slate-400">
                  {y.start_date} → {y.end_date}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <EditBtn onClick={() => openEdit(y)} />
                <DeleteBtn
                  loading={deletingId === y.id}
                  onClick={() => handleDelete(y.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editItem ? "Edit Academic Year" : "New Academic Year"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Name" required>
              <input
                className={inputCls}
                placeholder="e.g. 2024-2025"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.start_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start_date: e.target.value }))
                  }
                  required
                />
              </Field>
              <Field label="End Date" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_date: e.target.value }))
                  }
                  required
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <SaveBtn loading={saving} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Terms ───────────────────────────────────────────────────────────

function TermsTab() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Term | null>(null);
  const [form, setForm] = useState({
    name: "",
    academic_year_id: 0,
    start_date: "",
    end_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [t, y] = await Promise.all([fetchTerms(), fetchAcademicYears()]);
      setTerms(t);
      setAcademicYears(y);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditItem(null);
    setForm({
      name: "",
      academic_year_id: academicYears[0]?.id ?? 0,
      start_date: "",
      end_date: "",
    });
    setShowModal(true);
  }

  function openEdit(t: Term) {
    setEditItem(t);
    setForm({
      name: t.name,
      academic_year_id: t.academic_year_id,
      start_date: t.start_date,
      end_date: t.end_date,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await updateTerm(editItem.id, form);
        toast.success("Term updated.");
      } else {
        await createTerm(form);
        toast.success("Term created.");
      }
      setShowModal(false);
      load();
    } catch (err) {
      const msg =
        err instanceof HttpError
          ? String((err.payload as any)?.message ?? err.message)
          : "Failed to save.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this term?")) return;
    setDeletingId(id);
    try {
      await deleteTerm(id);
      toast.success("Deleted.");
      load();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  function yearName(id: number) {
    return academicYears.find((y) => y.id === id)?.name ?? "—";
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Term
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading…</div>
      ) : terms.length === 0 ? (
        <EmptyState message="No terms yet. Create one to get started." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
          {terms.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400">
                  {yearName(t.academic_year_id)} · {t.start_date} → {t.end_date}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <EditBtn onClick={() => openEdit(t)} />
                <DeleteBtn
                  loading={deletingId === t.id}
                  onClick={() => handleDelete(t.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editItem ? "Edit Term" : "New Term"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Term Name" required>
              <input
                className={inputCls}
                placeholder="e.g. Semester 1"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </Field>
            <Field label="Academic Year" required>
              <select
                className={selectCls}
                value={form.academic_year_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    academic_year_id: Number(e.target.value),
                  }))
                }
                required
              >
                <option value={0} disabled>
                  Select academic year…
                </option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.start_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start_date: e.target.value }))
                  }
                  required
                />
              </Field>
              <Field label="End Date" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_date: e.target.value }))
                  }
                  required
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <SaveBtn loading={saving} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Enrollments ─────────────────────────────────────────────────────

function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    class_id: 0,
    student_id: 0,
    enrolled_on: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [e, s, c] = await Promise.all([
        fetchEnrollments(),
        fetchStudents(),
        fetchClassesForAdmin(),
      ]);
      setEnrollments(e);
      setStudents(s);
      setClasses(c);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createEnrollment({
        class_id: form.class_id,
        student_id: form.student_id,
        enrolled_on: form.enrolled_on || undefined,
      });
      toast.success("Student enrolled.");
      setShowModal(false);
      load();
    } catch (err) {
      const msg =
        err instanceof HttpError
          ? Object.values((err.payload as any)?.errors ?? {})
              .flat()
              .join(", ") ||
            String((err.payload as any)?.message ?? err.message)
          : "Failed to enroll.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this enrollment?")) return;
    setDeletingId(id);
    try {
      await deleteEnrollment(id);
      toast.success("Enrollment removed.");
      load();
    } catch {
      toast.error("Failed to remove.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = enrollments.filter((en) => {
    const q = search.toLowerCase();
    return (
      (en.student?.user?.name ?? "").toLowerCase().includes(q) ||
      (en.classes?.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search student or class…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({
              class_id: classes[0]?.id ?? 0,
              student_id: students[0]?.id ?? 0,
              enrolled_on: "",
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Enrollment
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState message="No enrollments found." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
          {filtered.map((en) => (
            <div
              key={en.id}
              className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  {(en.student?.user?.name ?? "S").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {en.student?.user?.name ?? `Student #${en.student_id}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    {en.classes?.name ?? `Class #${en.class_id}`}
                    {en.enrolled_on ? ` · Enrolled ${en.enrolled_on}` : ""}
                  </p>
                </div>
              </div>
              <DeleteBtn
                loading={deletingId === en.id}
                onClick={() => handleDelete(en.id)}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Enrollment" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Student" required>
              <select
                className={selectCls}
                value={form.student_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, student_id: Number(e.target.value) }))
                }
                required
              >
                <option value={0} disabled>
                  Select student…
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name ?? `Student #${s.id}`} (
                    {s.student_code ?? s.id})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Class" required>
              <select
                className={selectCls}
                value={form.class_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, class_id: Number(e.target.value) }))
                }
                required
              >
                <option value={0} disabled>
                  Select class…
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Enrolled On">
              <input
                type="date"
                className={inputCls}
                value={form.enrolled_on}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enrolled_on: e.target.value }))
                }
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <SaveBtn loading={saving} label="Enroll Student" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Class Sessions ──────────────────────────────────────────────────

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function ClassSessionsTab() {
  const [sessions, setSessions] = useState<ClassSessionItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    class_id: 0,
    term_id: 0,
    teacher_id: 0,
    subject_id: 0,
    day_of_week: "Monday",
    start_time: "08:00",
    end_time: "09:00",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [se, cl, te, tc, su] = await Promise.all([
        fetchClassSessions(),
        fetchClassesForAdmin(),
        fetchTerms(),
        fetchTeachersForAdmin(),
        fetchSubjects(),
      ]);
      setSessions(se);
      setClasses(cl);
      setTerms(te);
      setTeachers(tc);
      setSubjects(su);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createClassSession(form);
      toast.success("Class session created.");
      setShowModal(false);
      load();
    } catch (err) {
      const msg =
        err instanceof HttpError
          ? Object.values((err.payload as any)?.errors ?? {})
              .flat()
              .join(", ") ||
            String((err.payload as any)?.message ?? err.message)
          : "Failed to create session.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this class session?")) return;
    setDeletingId(id);
    try {
      await deleteClassSession(id);
      toast.success("Deleted.");
      load();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  function className(id: number) {
    return classes.find((c) => c.id === id)?.name ?? `Class #${id}`;
  }
  function termName(id: number) {
    return terms.find((t) => t.id === id)?.name ?? `Term #${id}`;
  }
  function teacherName(id: number) {
    const t = teachers.find((t) => t.id === id);
    return t?.user?.name ?? t?.teacher_code ?? `Teacher #${id}`;
  }
  function subjectName(id: number) {
    return subjects.find((s) => s.id === id)?.name ?? `Subject #${id}`;
  }

  const dayColors: Record<string, string> = {
    Monday: "bg-sky-100 text-sky-700",
    Tuesday: "bg-indigo-100 text-indigo-700",
    Wednesday: "bg-violet-100 text-violet-700",
    Thursday: "bg-purple-100 text-purple-700",
    Friday: "bg-pink-100 text-pink-700",
    Saturday: "bg-orange-100 text-orange-700",
    Sunday: "bg-rose-100 text-rose-700",
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setForm({
              class_id: classes[0]?.id ?? 0,
              term_id: terms[0]?.id ?? 0,
              teacher_id: teachers[0]?.id ?? 0,
              subject_id: subjects[0]?.id ?? 0,
              day_of_week: "Monday",
              start_time: "08:00",
              end_time: "09:00",
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Session
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading…</div>
      ) : sessions.length === 0 ? (
        <EmptyState message="No class sessions yet. Create one to get started." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge
                  label={s.day_of_week.slice(0, 3)}
                  color={
                    dayColors[s.day_of_week] ?? "bg-slate-100 text-slate-600"
                  }
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {className(s.class_id)} · {subjectName(s.subject_id)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {teacherName(s.teacher_id)} · {termName(s.term_id)} ·{" "}
                    {s.start_time}–{s.end_time}
                  </p>
                </div>
              </div>
              <DeleteBtn
                loading={deletingId === s.id}
                onClick={() => handleDelete(s.id)}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Class Session" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Class" required>
                <select
                  className={selectCls}
                  value={form.class_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, class_id: Number(e.target.value) }))
                  }
                  required
                >
                  <option value={0} disabled>
                    Select…
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Term" required>
                <select
                  className={selectCls}
                  value={form.term_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, term_id: Number(e.target.value) }))
                  }
                  required
                >
                  <option value={0} disabled>
                    Select…
                  </option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Teacher" required>
                <select
                  className={selectCls}
                  value={form.teacher_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      teacher_id: Number(e.target.value),
                    }))
                  }
                  required
                >
                  <option value={0} disabled>
                    Select…
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.name ?? t.teacher_code ?? `#${t.id}`}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subject" required>
                <select
                  className={selectCls}
                  value={form.subject_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      subject_id: Number(e.target.value),
                    }))
                  }
                  required
                >
                  <option value={0} disabled>
                    Select…
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Day of Week" required>
              <select
                className={selectCls}
                value={form.day_of_week}
                onChange={(e) =>
                  setForm((f) => ({ ...f, day_of_week: e.target.value }))
                }
                required
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time" required>
                <input
                  type="time"
                  className={inputCls}
                  value={form.start_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start_time: e.target.value }))
                  }
                  required
                />
              </Field>
              <Field label="End Time" required>
                <input
                  type="time"
                  className={inputCls}
                  value={form.end_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_time: e.target.value }))
                  }
                  required
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <SaveBtn loading={saving} label="Create Session" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function AdminManagementPage() {
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllRoles()
        .then(setRoles)
        .catch(() => {});
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Access Restricted
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            You need admin or super_admin role to access this page.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "users",
      label: "Users & Roles",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      key: "enrollments",
      label: "Enrollments",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      ),
    },
    {
      key: "academic",
      label: "Academic Years",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      key: "terms",
      label: "Terms",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      ),
    },
    {
      key: "sessions",
      label: "Class Sessions",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Admin Management
          </h2>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
            Admin Only
          </span>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Manage users, roles, enrollments, terms, and class sessions.
        </p>
      </div>

      {/* Tab Nav */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <TabBtn
            key={t.key}
            label={t.label}
            icon={t.icon}
            active={activeTab === t.key}
            onClick={() => setActiveTab(t.key)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        {activeTab === "users" && (
          <UsersTab roles={roles} isSuperAdmin={isSuperAdmin} />
        )}
        {activeTab === "enrollments" && <EnrollmentsTab />}
        {activeTab === "academic" && <AcademicYearsTab />}
        {activeTab === "terms" && <TermsTab />}
        {activeTab === "sessions" && <ClassSessionsTab />}
      </div>
    </div>
  );
}
