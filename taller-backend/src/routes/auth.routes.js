import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    // ----------------------------------------------------
    // Rutas Públicas (No requieren token)
    // ----------------------------------------------------

    // POST /api/v1/auth/login -> Iniciar sesión
    router.post('/login', AuthController.login);

    // POST /api/v1/auth/refresh-token -> Generar nuevo accessToken
    router.post('/refresh-token', AuthController.refreshToken);

    // ----------------------------------------------------
    // Rutas Protegidas (Requieren Access Token válido)
    // ----------------------------------------------------

    // POST /api/v1/auth/logout -> Cerrar sesión y limpiar cookie
    router.post('/logout', authenticateToken, AuthController.logout);

    // GET /api/v1/auth/me -> Obtener datos del perfil autenticado
    router.get('/me', authenticateToken, AuthController.getProfile);

    return router;
  }
}