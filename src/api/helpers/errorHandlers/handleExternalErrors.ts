export const handleExternalErrors = (err: any) => {
  err.status = err.error.status;
  err.message = err.error.message;
};
