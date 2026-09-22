import ms from 'ms';
import { env } from '../config/env.config.js';
import { AuthService } from '../services/auth.service.js';
import { BadRequestError } from '../utils/errors.js';

export class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // 1. Validar que se proporcionen email y contraseña
            if (!email || !password) {
                throw new BadRequestError('Email y contraseña son obligatorios');
            }

            // 2. Llamar al método loginUser del AuthService para autenticar al usuario
            const { accessToken, refreshToken, user } = await AuthService.loginUser(email, password);

            // 3. Crear cookie para el refresh token con las opciones de seguridad
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: env.nodeEnv === 'production',
                sameSite: 'strict',
                maxAge: ms(env.jwt.refreshExpiresIn)
            });

            // 4. Enviar la respuesta con el access token y los datos del usuario
            return res.status(200).json({
                status: 'success',
                message: 'Usuario autenticado correctamente',
                data: {
                    accessToken,
                    user
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    static async refreshToken(req, res, next) {
        try {
            // 1. Obtener el refresh token de la cookie
            const refreshToken = req.cookies?.refreshToken;
            
            // 2. Renovar el token de acceso
            const { accessToken } = await AuthService.refreshToken(refreshToken);

            return res.status(200).json({
                status: 'success',
                message: 'Token de acceso renovado correctamente',
                data: {
                    accessToken
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    static async logout(req, res, next) {
        try {
            // 1. Opcional: Ejecutar lógica en servicio (por si agregas blacklist a futuro)
            await AuthService.logoutUser();

            // 2. Limpiar la cookie HTTP-Only usando las mismas opciones de configuración
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: env.nodeEnv === 'production',
                sameSite: 'strict'
            });

            return res.status(200).json({
                status: 'success',
                message: 'Sesión cerrada correctamente'
            });
        } catch (error) {
            return next(error);
        }
    }

    static async getProfile(req, res, next) {
        try {
            // req.user.id es inyectado previamente por el auth.middleware
            const user = await AuthService.getUserProfile(req.user.id);

            return res.status(200).json({
                status: 'success',
                message: 'Perfil del usuario obtenido correctamente',
                data: {
                    user
                }
            });
        } catch (error) {
            return next(error);
        }
    }
}