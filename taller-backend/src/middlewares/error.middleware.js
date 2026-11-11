// Middleware de manejo de errores
export const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || 'Error interno del servidor';

    if (err.code === 'ER_DUP_ENTRY') {
      statusCode = 409;
      message = 'Registro duplicado. La clave única ya existe en el sistema';
    }

    const response = {
      type: `https://httpstatuses.com/${statusCode}`,
      title: statusCode === 500 ? 'Error Interno del Servidor' : 'Error de Solicitud',
      status: statusCode,
      message,
      detail: message,
      instance: req.originalUrl,
      timestamps: new Date().toISOString()
    };

    if (statusCode === 500) {
      console.error('💥 ERROR NO CONTROLADO:', err);
    }

    return res.status(statusCode).json(response);
}