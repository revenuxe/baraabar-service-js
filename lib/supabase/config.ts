// Shared by the authentication proxy and server clients. Never log key values.
export function publicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  try {
    if (!['https:', 'http:'].includes(new URL(url).protocol)) return null;
  } catch { return null; }
  return { url, key };
}

export const supabaseFetch: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(10000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
};
