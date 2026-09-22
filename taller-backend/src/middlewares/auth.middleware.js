import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

// 1. Middleware para autenticación de usuarios mediante JWT
export const authenticateToken = (req, _res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        // Formato del token: "Bearer <token>"
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next(new UnauthorizedError('Token de autenticación no proporcionado'));
        }

        // Usamos env.jwt.secret para verificar el token
        const decoded = jwt.verify(token, env.jwt.secret);

        // Inyectamos la información del usuario en la solicitud para los controladores
        req.user = decoded;
        return next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new UnauthorizedError('El token ha expirado. Por favor, reinicie sesión'));
        }
        if (error instanceof jwt.JsonWebTokenError) { 
            return next(new UnauthorizedError('Token de autenticación inválido'));
        }
        return next(error);
    }
};

// 2. Middleware para autorización de roles
export const authorizeRoles = (...allowedRoles) => {
    return (req, _res, next) => {
        // Salvaguarda por si el middleware de autenticación no se ejecutó previamente
        if (!req.user || !req.user.role) {
            return next(new UnauthorizedError('Usuario no autenticado'));
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return next(new ForbiddenError('No tiene permisos para acceder a este recurso'));
        }

        return next();
    };
};