export const getApiErrorMessage = (error, fallback = 'Ocurrió un error inesperado.') => {
  if (!error) return fallback;

  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
};
