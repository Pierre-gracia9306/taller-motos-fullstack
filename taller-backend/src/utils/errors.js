// Clase base abstracta que hereda de la clase nativa Error de JavaScript
export class AppError extends Error {
    constructor (message,statusCode){
        super(message);
        this.statusCode= statusCode;
        this.status = `${statusCode}` .startsWith('4') ? 'fail':'error';
        this.isOperational = true; // Diferencia errores conocidos del negocio vs bug no controlados

        Error.captureStackTrace(this, this.constructor);
    }
}

//400 Bad Request: Datos de entrada invalidos o faltantes
export class BadRequestError extends AppError{
    constructor(message= 'Solicitud incorrecta o datos inválidos'){
        super(message, 400);
    }
}

//400 Bad Error: Transición de estado no permitida en el flujo de trabajo
export class InvalidStateTransitionError extends AppError {
  constructor(message = "Transición de estado no permitida en el flujo de trabajo.") {
    super(message, 400);
  }
}

// 400 Bad Error: Intento de entregar una orden con ítems pendientes de finalizar
export class PendingItemsError extends AppError {
  constructor(message = "No se puede entregar la orden porque existen ítems sin finalizar.") {
    super(message, 400);
  }
}

// 400 Bad Error: Intento de modificar una orden que ya se encuentra finalizada o cancelada
export class OrderClosedError extends AppError {
  constructor(message = "La orden se encuentra finalizada o cancelada y no admite cambios.") {
    super(message, 400);
  }
}



//401 Unauthorized : Credenciales incorrectas o falta de token
export class UnauthorizedError extends AppError{
    constructor(message='No autorizado. Autenticación requerida'){
        super(message, 401);
    }
}

//403 Forbidden: Sin permisos para ejecutar esta acción (RN-04, RN-05)
export class ForbiddenError extends AppError{
    constructor(message='Acceso prohibido. No tienes permisos suficientes'){
        super(message, 403);
    }
}

//404 Not Found: Recurso no encontrado en BD
export class NotFoundError extends AppError{
    constructor(message='El recurso solicitado no fue encontrado'){
        super(message, 404);
    }
}

//409 Conflict: Violación de restricción de unicidad (ej. Placa repetida RN-07)
export class ConflictError extends AppError{
    constructor(message='Existe un conflicto con el estado actual del recurso'){
        super(message, 409);
    }
}