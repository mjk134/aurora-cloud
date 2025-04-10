
type Result<T, E> = { value: T; success: true } | { value: E; success: false };

/**
 * Try catch wrapper for async functions
 */
export async function tryCatch<T, E>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return {
      value: await promise,
      success: true,
    }
  } catch (error) {
    console.warn("An error occured: ", error);
    return {
      value: error as E,
      success: false,
    }
  }
}
