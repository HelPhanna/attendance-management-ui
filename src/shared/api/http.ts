import axios, { AxiosError } from "axios";
import { getAuthToken } from "@shared/auth/session";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000/api";

// ─── Axios instance (no interceptors — token attached per-request below) ──

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// ─── HttpError ────────────────────────────────────────────────────────────

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function toHttpError(err: unknown): never {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 0;
    const payload = err.response?.data ?? null;
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as Record<string, unknown>).message === "string"
        ? ((payload as Record<string, unknown>).message as string)
        : err.message || `Request failed (${status})`;
    throw new HttpError(message, status, payload);
  }
  throw err;
}

// ─── Types ────────────────────────────────────────────────────────────────

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Set false to skip the Authorization header (public endpoints) */
  auth?: boolean;
};

type FormDataRequestOptions = {
  method?: "POST" | "PUT" | "PATCH";
  body: FormData;
  auth?: boolean;
};

// ─── apiRequest (JSON) ────────────────────────────────────────────────────

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const method = options.method ?? "GET";
  const shouldAttachToken = options.auth !== false;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (shouldAttachToken) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await axiosInstance.request<T>({
      url,
      method,
      data: options.body,
      headers,
    });
    return response.data;
  } catch (err) {
    toHttpError(err);
  }
}

// ─── apiRequestFormData (multipart) ──────────────────────────────────────

export async function apiRequestFormData<T>(
  endpoint: string,
  options: FormDataRequestOptions,
): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const method = options.method ?? "POST";
  const shouldAttachToken = options.auth !== false;

  // Do NOT set Content-Type — axios sets it automatically with the correct
  // multipart boundary when the body is FormData
  const headers: Record<string, string> = {};

  if (shouldAttachToken) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await axiosInstance.request<T>({
      url,
      method,
      data: options.body,
      headers,
    });
    return response.data;
  } catch (err) {
    toHttpError(err);
  }
}
