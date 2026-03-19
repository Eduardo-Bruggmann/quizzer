export const returnOneElement = <T>(result: T | T[]) =>
  Array.isArray(result) ? result[0] : null
