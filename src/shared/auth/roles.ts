import type { SessionUser } from "./session";

const ADMIN_ROLE_KEYS = new Set(["admin", "super_admin"]);

function normalizeRole(value: string | null | undefined): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function getUserRoleKeys(user?: SessionUser | null): string[] {
  if (!user?.roles?.length) {
    return [];
  }

  return user.roles
    .map((role) => normalizeRole(role.key || role.name))
    .filter(Boolean);
}

export function hasAdminAccess(user?: SessionUser | null): boolean {
  return getUserRoleKeys(user).some((role) => ADMIN_ROLE_KEYS.has(role));
}

export function hasSuperAdminAccess(user?: SessionUser | null): boolean {
  return getUserRoleKeys(user).includes("super_admin");
}
