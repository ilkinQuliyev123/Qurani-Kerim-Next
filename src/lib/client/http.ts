/** Brauzer tərəfi JSON fetch köməkçisi. 401 → giriş səhifəsi. Xəta olarsa Error(err) atır, data əlavə olunur. */
export class ApiError extends Error {
  constructor(public status: number, public data: { err?: string } | null) {
    super(data?.err ?? String(status));
  }
}

export async function http<T = unknown>(url: string, opt: { method?: string; body?: unknown } = {}): Promise<T> {
  const r = await fetch(url, {
    method: opt.method ?? (opt.body !== undefined ? "POST" : "GET"),
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: opt.body !== undefined ? JSON.stringify(opt.body) : undefined,
  });
  if (r.status === 401) { location.href = "/login"; throw new ApiError(401, null); }
  const text = await r.text();
  const data = text ? JSON.parse(text) : null;
  if (!r.ok) throw new ApiError(r.status, data);
  return data as T;
}
