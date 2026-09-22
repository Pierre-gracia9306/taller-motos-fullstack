import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors.js';

export class AuthService {
    
    // 1. Iniciar sesión y generar tokens
    static async loginUser(email, password) {
        // 1.1 Buscar usuario por email en la base de datos
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        // 1.2 Validar si el usuario está activo (Regla de Negocio)
        if (!user.active) {
            throw new ForbiddenError('Credenciales inválidas');
        }

        // 1.3 Comparar la contraseña enviada con el hash guardado
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new UnauthorizedError('Credenciales inválidas');
        }   

        // 1.4.1 Generar access token JWT con id y role del usuario
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            env.jwt.secret,
            { expiresIn: env.jwt.expiresIn }
        );

        // 1.4.2 Generar refresh token JWT con id y role del usuario
        const refreshToken = jwt.sign(
            { id: user.id, role: user.role },
            env.jwt.refreshSecret,
            { expiresIn: env.jwt.refreshExpiresIn }
        );

        // 1.5. Retornar objeto sin password_hash
        const { password_hash, ...userWithoutPassword } = user;

        return {
            accessToken,
            refreshToken,
            user: userWithoutPassword
        };
    }

    // 2. Refrescar el token de acceso usando el refresh token
    static async refreshToken(token) {
        if (!token) {
            throw new UnauthorizedError('Refresh token no proporcionado');
        }

        try {
            // 2.1 Verificar y decodificar el refresh token usando la clave secreta
            const decoded = jwt.verify(token, env.jwt.refreshSecret);

            // 2.2 Buscar el usuario en la base de datos
            const user = await UserModel.findById(decoded.id);
            if (!user) {
                throw new UnauthorizedError('Usuario no encontrado');
            }

            // 2.3 Verificar si el usuario está activo
            if (!user.active) {
                throw new ForbiddenError('Usuario inactivo');
            }

            // 2.4 Generar un nuevo access token
            const newAccessToken = jwt.sign(
                { id: user.id, role: user.role },
                env.jwt.secret,
                { expiresIn: env.jwt.expiresIn }
            );

            return {
                accessToken: newAccessToken,
            };

        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('El refresh token ha expirado. Por favor, inicie sesión nuevamente');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Refresh token inválido');
            }
            throw error;
        }
    }

    // 3. Obtener el perfil del usuario autenticado 
    static async getUserProfile(userId) {
        const user = await UserModel.findByIdWithoutPassword(userId);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }
        if (!user.active) {
            throw new ForbiddenError('El usuario se encuentra inactivo');
        }
        return user;
    }

    // 4. Lógica de cierre de sesión
    static async logoutUser() {
        // Al manejar stateless JWTs en Cookies HTTP-Only, la invalidación principal
        // ocurre destruyendo la cookie desde el Controller. Si en el futuro agregas 
        // una blacklist o tabla de refresh tokens revocados, esa query irá aquí.
        return { message: 'Sesión cerrada correctamente' };
    }
}