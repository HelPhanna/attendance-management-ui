import { getAuthToken } from "@shared/auth/session";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000/api";

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

type FormDataRequestOptions = {
  method?: "POST" | "PUT" | "PATCH";
  body: FormData;
  auth?: boolean;
};

function parseJsonPayload(text: string): unknown {
  const withoutBom = text.replace(/^\uFEFF/, "").trim();
  if (!withoutBom) {
    return null;
  }

  try {
    return JSON.parse(withoutBom);
  } catch {
    const firstJsonCharIndex = withoutBom.search(/[[{]/);
    if (firstJsonCharIndex === -1) {
      throw new Error("The server returned invalid JSON.");
    }

    const recovered = withoutBom.slice(firstJsonCharIndex);
    return JSON.parse(recovered);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();
  const shouldUseAuth = options.auth ?? true;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (shouldUseAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    payload = parseJsonPayload(rawText);
  } else {
    payload = rawText;
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Request failed (${response.status})`;

    throw new HttpError(message, response.status, payload);
  }

  return payload as T;
}

export async function apiRequestFormData<T>(
  endpoint: string,
  options: FormDataRequestOptions,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();
  const shouldUseAuth = options.auth ?? true;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (shouldUseAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? "POST",
    headers,
    body: options.body,
  });

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    payload = parseJsonPayload(rawText);
  } else {
    payload = rawText;
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Request failed (${response.status})`;

    throw new HttpError(message, response.status, payload);
  }

  return payload as T;
}
