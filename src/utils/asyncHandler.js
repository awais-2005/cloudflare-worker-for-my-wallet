export function asyncHandler(fn) {
  return async (c, next) => {
    try {
      await fn(c, next);
    } catch (err) {
      next(err);
    }
  };
}
