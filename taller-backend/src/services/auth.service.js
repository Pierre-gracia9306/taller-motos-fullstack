import bcrypt from 'bcryptjs';
import jwt  from 'jsonwebtoken';
import { env } from '../config/env.js';
import {UserModel} from '../models/user.model.js';
import {UnauthorizedError, ForbiddenError} from '../utils/errors.js';

export class AuthService {
    static async loginUser(email, password) {

        // 1. Buscar usuario por email en la base de datos
        const user = await UserModel.findByEmail(email);
        if (!user) {
        throw new UnauthorizedError('Credenciales inválidas');
        }

        // 2. Validar si el usuario está activo (Regla de Negocio)
        if (!user.active) {
        throw new ForbiddenError('Credenciales inválidas');
        }

        // 3. Comparar la contraseña enviada con el hash guardado
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
        throw new UnauthorizedError('Credenciales inválidas');
        }   

        //4A. Generar acceso token JWT con id y role del usuario, usando la clave secreta y tiempo de expiración
        const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn}
        );

        //4B. Generar refresh token JWT con id y role del usuario, usando la clave secreta y tiempo de expiración
        const refreshToken = jwt.sign(
        { id: user.id, role: user.role},
        env.jwt.refreshSecret,
        { expiresIn: env.jwt.refreshExpiresIn}
        );

        //5. Retornar un objeto con accessToken, refreshToken y datos del usuario (sin password_hash)
        const { password_hash, ...userWithoutPassword } = user;

        return {
        accessToken,
        refreshToken,
        user: userWithoutPassword
        };
    }

    // Método para refrescar el token de acceso usando el refresh token
    static async refreshToken(token) {
        if (!token) {
            throw new UnauthorizedError('Refresh token no proporcionado');
        }

        try {
            
            // 1. Verificar y decodificar el refresh token usando la clave secreta
            const decoded = jwt.verify(token, env.jwt.refreshSecret);

            // 2. Buscar el usuario en la base de datos usando el id del token decodificado
            const user = await UserModel.findById(decoded.id);
            if (!user) {
                throw new UnauthorizedError('Usuario no encontrado');
            }

            // 3. verificar si el usuario está activo
            if (!user.active) {
                throw new ForbiddenError('Usuario inactivo');
            }

            // 4. Generar un nuevo access token
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
            throw error; // Re-lanzar cualquier otro error
        }
    }           
}

