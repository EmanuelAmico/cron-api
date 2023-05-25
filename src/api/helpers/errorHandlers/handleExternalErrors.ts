/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleExternalErrors = (err: any) => {
  err.status = err.error.status;
  err.message = err.error.message;
};
