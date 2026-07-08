// Node 26 defines an inert experimental global `localStorage` that shadows the
// one jsdom provides, so tests see a non-functional Web Storage. Install a
// working in-memory implementation whenever the active storage can't be used.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function isUsable(storage: unknown): boolean {
  try {
    if (!storage) return false;
    const s = storage as Storage;
    const probe = '__storage_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (!isUsable((globalThis as unknown as Record<string, unknown>)[name])) {
    Object.defineProperty(globalThis, name, {
      value: new MemoryStorage(),
      configurable: true,
      writable: true,
    });
  }
}
