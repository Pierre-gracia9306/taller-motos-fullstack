import { AppError } from "../utils/errors.js";

// Middleware de manejo de errores
export const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || 'Error interno del servidor';


//Manejo especial para errores directos de driver MySQL (Ej. Placa unica violada)
if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Registro duplicado. La clave única ya existe en el sistema';
}

// Estructura de respuesta Estandar (RFC 7807)
const response = {
    type: `https://httpstatuses.com/${statusCode}`,
    title: statusCode === 500 ? 'Error Interno del Servidor' : 'Error de Solicitud',
    status: statusCode,
    detail: message,
    instance: req.originalUrl,
    timestamps: new Date ().toISOString()
};

// Si es un error 500 (un fallo no esperado del sistema), imprímelo SIEMPRE.
if (statusCode === 500) {
  console.error('💥 ERROR NO CONTROLADO:', err);
}

return res.status(error.statusCode).json(response);
}