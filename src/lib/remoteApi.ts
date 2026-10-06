const DEFAULT_TIMEOUT_MS = 12_000;

let groqReachable: boolean | null = null;

export function markGroqUnavailable() {
  groqReachable = false;
}

export function isGroqUnavailable() {
  return groqReachable === false;
}

export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (groqReachable === false) {
    throw new Error("api-down");
  }
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: ctrl.signal });
    if (response.status === 404 || response.status === 501 || response.status === 503) {
      groqReachable = false;
    } else if (response.ok) {
      groqReachable = true;
    }
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      groqReachable = false;
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}
