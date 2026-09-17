import {Router} from 'express';
import {login, refreshToken} from '../controllers/auth.controller.js';

const router = Router();

// Ruta para el login de usuarios POST /api/auth/login
router.post('/login', login);
// Ruta para refrescar el token POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

export default router;