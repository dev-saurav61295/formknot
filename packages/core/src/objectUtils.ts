/**
 * Safe object-handling utilities shared across FormKnot packages.
 *
 * These guard against prototype-pollution style attacks when working with
 * data that originates outside the application (imported JSON, submitted
 * form values, etc).
 */

export const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export function isUnsafeKey(key: string): boolean {
  return UNSAFE_KEYS.has(key);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deep-clones a JSON-compatible value while stripping unsafe keys
 * (`__proto__`, `prototype`, `constructor`) at every level.
 */
export function safeClone<T>(value: T): T {
  return safeCloneInternal(value, 0) as T;
}

const MAX_CLONE_DEPTH = 64;

function safeCloneInternal(value: unknown, depth: number): unknown {
  if (depth > MAX_CLONE_DEPTH) {
    throw new Error("safeClone: maximum depth exceeded, possible circular structure");
  }
  if (Array.isArray(value)) {
    return value.map((item) => safeCloneInternal(item, depth + 1));
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      if (isUnsafeKey(key)) continue;
      result[key] = safeCloneInternal(value[key], depth + 1);
    }
    return result;
  }
  return value;
}

/** Recursively removes unsafe keys from parsed JSON without cloning primitives unnecessarily. */
export function sanitizeParsedJson(value: unknown): unknown {
  return safeClone(value);
}

/** Safe `get` that refuses to traverse through unsafe keys. */
export function safeGet(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (isUnsafeKey(key)) return undefined;
    if (!isPlainObject(current)) return undefined;
    current = current[key];
  }
  return current;
}

/** Safe, immutable `set`: returns a new object tree with the value set at `path`. */
export function safeSet<T extends Record<string, unknown>>(obj: T, path: string[], value: unknown): T {
  if (path.length === 0) return obj;
  const [head, ...rest] = path as [string, ...string[]];
  if (isUnsafeKey(head)) return obj;
  const next: Record<string, unknown> = isPlainObject(obj) ? { ...obj } : {};
  if (rest.length === 0) {
    next[head] = value;
  } else {
    const child = isPlainObject(next[head]) ? (next[head] as Record<string, unknown>) : {};
    next[head] = safeSet(child, rest, value);
  }
  return next as T;
}

export function safeJsonParse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(text, (key, val) => {
      if (isUnsafeKey(key)) return undefined;
      return val;
    });
    return { ok: true, value: sanitizeParsedJson(parsed) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}
