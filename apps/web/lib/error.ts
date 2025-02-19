
/**
 * Try catch wrapper for async functions
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.warn(error);
    return null;
  }
}