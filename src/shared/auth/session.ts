export type SessionRole = {
  id: number;
  name: string;
  key?: string;
};

export type SessionUserProfile = {
  first_name?: string | null;
  last_name?: string | null;
  image?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  userProfile?: SessionUserProfile | null;
  roles?: SessionRole[];
};

export type AuthSession = {
  token: string;
  user: SessionUser;
};

const AUTH_STORAGE_KEY = "attendance_auth_session";

export function saveSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthToken(): string | null {
  return getSession()?.token ?? null;
}

export function getDisplayName(user?: SessionUser | null): string {
  if (!user) {
    return "Teacher";
  }

  const firstName = user.userProfile?.first_name?.trim();
  const lastName = user.userProfile?.last_name?.trim();

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(" ");
  }

  return user.name || user.email;
}
