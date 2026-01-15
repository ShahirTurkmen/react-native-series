import { readApiSecret } from "./useApiSecret";

export const API_BASE = "https://coffee-api-five.vercel.app";
// export const API_BASE = "http://192.168.0.112:3000";
const BASE = API_BASE;

export type RemoteCoffee = {
  id: number;
  name: string;
  image: string;
  description: string;
};

function fullImageUrl(imagePath: string) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  // images on the API are served at /images
  return `${BASE}${imagePath}`;
}

async function fetchJson<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const httpErr = {
      url,
      status: res.status,
      statusText: res.statusText,
      body,
    };
    try {
      _notifyHttpError(httpErr);
    } catch (e) {
      // ignore notifier errors
    }
    // Return null to allow callers to handle errors and avoid throwing unhandled exceptions
    return null as unknown as T;
  }
  return (await res.json()) as T;
}

export async function getCoffees(): Promise<RemoteCoffee[]> {
  return fetchJson<RemoteCoffee[]>(`${BASE}/coffees`);
}

// Try to load coffees from remote API; on error return a small hard-coded fallback list.
// Note: removed hard-coded fallback. Callers should handle fetch failures and fall back to local assets when needed.

export async function getCoffeeById(id: number): Promise<RemoteCoffee> {
  const json = await fetchJson<RemoteCoffee>(`${BASE}/coffee/${id}`);
  return json;
}

export async function getCoffeeByName(name: string): Promise<RemoteCoffee> {
  const encoded = encodeURIComponent(name);
  return fetchJson<RemoteCoffee>(`${BASE}/coffee/name/${encoded}`);
}

export async function searchByDescription(q: string): Promise<RemoteCoffee[]> {
  const encoded = encodeURIComponent(q);
  return fetchJson<RemoteCoffee[]>(`${BASE}/coffee/desc/${encoded}`);
}

async function authHeaders(): Promise<HeadersInit> {
  const secret = await readApiSecret();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (secret && secret.trim() !== "") {
    (headers as any)["x-api-secret"] = secret;
  }
  return headers;
}

export async function addCoffee(payload: {
  name: string;
  image?: string;
  description?: string;
}) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/add-coffee`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    console.log("addCoffee error body:", body?.error, body?.err, res.status);
    // notify http error and return body error string (or null)
    try {
      _notifyHttpError({
        url: `${BASE}/add-coffee`,
        status: res.status,
        statusText: res.statusText,
        body,
      });
    } catch (e) {
      // ignore
    }
    return body?.error;
  }
  const returningRes = (await res.json()) as RemoteCoffee;
  _notifyApiSecretSubscribers(true);
  return returningRes;
}

export async function patchCoffee(
  id: number,
  patch: { name?: string; description?: string }
) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/coffee/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to patch coffee: ${res.status}`);
  }
  return (await res.json()) as RemoteCoffee;
}

type CoffeeApiListener = (value: boolean) => void;
const _listeners = new Set<CoffeeApiListener>();
export function subscribeCoffeeApi(listener: CoffeeApiListener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}
function _notifyApiSecretSubscribers(value: boolean) {
  _listeners.forEach((l) => {
    try {
      l(value);
    } catch (e) {
      // ignore
    }
  });
}

type HttpError = {
  url: string;
  status: number;
  statusText: string;
  body?: any;
};
type HttpErrorListener = (err: HttpError) => void;
const _httpListeners = new Set<HttpErrorListener>();
export function subscribeHttpError(listener: HttpErrorListener) {
  _httpListeners.add(listener);
  return () => _httpListeners.delete(listener);
}
function _notifyHttpError(err: HttpError) {
  _httpListeners.forEach((l) => {
    try {
      l(err);
    } catch (e) {
      // ignore
    }
  });
}

export default {
  getCoffees,
  getCoffeeById,
  getCoffeeByName,
  searchByDescription,
  addCoffee,
  patchCoffee,
  fullImageUrl,
};
