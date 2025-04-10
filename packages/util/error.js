/**
 * Try-catch wrapper for async functions
 */
async function tryCatch(promise) {
  try {
    return {
      value: await promise,
      success: true,
    };
  } catch (error) {
    return {
      value: error,
      success: false,
    };
  }
}

/**
 * Try-catch wrapper for synchronous functions
 */
function tryCatchSync(fn) {
  try {
    return {
      value: fn(),
      success: true,
    };
  } catch (error) {
    return {
      value: error,
      success: false,
    };
  }
}

module.exports = {
  tryCatch,
  tryCatchSync,
};
