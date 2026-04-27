import { apiRequest } from "@shared/api/http";
import type { SessionUser } from "@shared/auth/session";

type LoginResponse = {
  token: string;
  user: SessionUser;
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
