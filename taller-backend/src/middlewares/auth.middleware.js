import jwt from 'jsonwebtoken';
import {UnauthorizedError, ForbiddenError} from '../utils/errors.js';

// 1. Middleware para autenticación de usuarios mediante JWT
export const authenticateToken = (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    //Formato del token: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        throw new UnauthorizedError('Token de autenticación no proporcionado');
    }

    try {
        // Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Inyectamos {id, role} del usuario en la solicitud para su uso posterior
        next(); 
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('El token ha expirado. Por favor, reinicie sesión');
        }
        throw new UnauthorizedError('Token de autenticación inválido');
    }
};

    //2. Middleware para autorización de roles
export const authorizeRoles = (...allowedRoles) => {
    return (req, _res, next) => {
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            throw new ForbiddenError('No tiene permisos para acceder a este recurso');
        }
        next();
        };
    };

