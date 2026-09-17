import * as authService from '../services/auth.service.js';
import {BadRequestError} from '../utils/errors.js';
import ms from 'ms';

export const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        // Validar que se envíen email y password
        if(!email || !password){
            throw new BadRequestError('Email y contraseña son Obligatorios');
        }

        const {accessToken, refreshToken, user} = await authService.loginUser(email, password);
        // Guardar el refresh token en una cookie segura
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: ms(process.env.JWT_REFRESH_EXPIRES_IN || '30d')
        });
       // Retornar el access token y los datos del usuario (sin password_hash)
        res.status(200).json({
            status: 'success',
            message: 'Usuario autenticado correctamente',
            data: {accessToken, user}
        });
    } catch (error) {
        next(error);
    }
};