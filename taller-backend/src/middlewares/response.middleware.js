export const responseHandler = (_req, res, next) => {
  // 1. Método para respuestas exitosas estándar (200 OK por defecto)
  res.success = (data = null, message = 'Operación exitosa', statusCode = 200) => {
    const body = {
      status: 'success',
      message
    };

    // Si le pasamos datos, los adjuntamos a la respuesta
    if (data !== null && data !== undefined) {
      body.data = data;
    }

    return res.status(statusCode).json(body);
  };

  // 2. Método helper específico para creaciones (201 Created)
  res.created = (data = null, message = 'Recurso creado exitosamente') => {
    return res.success(data, message, 201);
  };

  next();
};