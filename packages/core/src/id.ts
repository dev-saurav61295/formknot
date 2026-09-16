let counter = 0;

/** Generates a reasonably unique id without relying on Node-only APIs. */
export function generateId(prefix = "fk"): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${random}${counter}`;
}
