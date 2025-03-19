
type Result<T> = { value: T; success: true } | { value: unknown; success: false };

/**
 * Try catch wrapper for async functions
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return {
      value: await fn(),
      success: true,
    }
  } catch (error) {
    console.warn(error);
    return {
      value: error,
      success: false,
    }
  }
}
