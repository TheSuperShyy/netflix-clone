type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

export function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const existing = store.get(key) as Entry<T> | undefined;
  const now = Date.now();
  if (existing && existing.expires > now) {
    return Promise.resolve(existing.value);
  }
  return loader().then((value) => {
    store.set(key, { value, expires: now + ttlMs });
    return value;
  });
}
