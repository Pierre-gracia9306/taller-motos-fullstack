import {Router} from 'express';
import {AuthController} from '../controllers/auth.controller.js';

const router = Router();

// Ruta para el login de usuarios POST /api/auth/login
router.post('/login', AuthController.login);

// Ruta para refrescar el token POST /api/auth/refresh-token
router.post('/refresh-token', AuthController.refreshToken);

export default router;