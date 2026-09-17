import bcrypt from 'bcryptjs';
import jwt  from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import {UnauthorizedError, ForbiddenError} from '../utils/errors.js';

export const loginUser = async (email, password) =>{
    // 1. Buscar usuario por email en la base de datos
    const user = await userModel.findByEmail(email);
    if(!user){
        throw new UnauthorizedError('Credenciales inválidas');
    }

    // 2. Validar si el usuario está activo (Regla de Negocio)
    if(!user.active){
        throw new ForbiddenError('Credenciales inválidas');
    }

    // 3. Comparar la contraseña enviada con el hash guardado
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
        throw new UnauthorizedError('Credenciales inválidas');
    }

    // 4A. Generar acceso token JWT con id y role del usuario, usando la clave secreta y tiempo de expiración
    const accessToken = jwt.sign(
        {id: user.id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || '1h'} 
    );

    // 4B. Generar refresh token JWT con id y role del usuario, usando la clave secreta y tiempo de expiración
    const refreshToken = jwt.sign(
        {id: user.id, role: user.role},
        process.env.JWT_REFRESH_SECRET,
        {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'} 
    );

    // 5. Retornar token y datos del usuario (excluyendo password_hash)
    const {password_hash: _, ...userWithoutPassword} = user;

    return {
        accessToken,
        refreshToken,
        user: userWithoutPassword
    };


    };
        
