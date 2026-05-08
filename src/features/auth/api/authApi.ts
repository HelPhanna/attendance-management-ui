import { apiRequest } from "@shared/api/http";
import type { SessionUser } from "@shared/auth/session";

type LoginResponse = {
  token: string;
  user: SessionUser;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export async function loginApi(email: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export async function logoutApi() {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export async function registerApi(payload: RegisterPayload) {
  return apiRequest<{ message: string }>("/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });
}
