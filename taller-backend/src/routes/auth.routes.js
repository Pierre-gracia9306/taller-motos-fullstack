import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export class AuthRoutes {
  static get routes() {
    const router = Router();

   
    router.post('/login', AuthController.login);

    
    router.post('/refresh-token', AuthController.refreshToken);

    
    router.post('/logout', authenticateToken, AuthController.logout);

    
    router.get('/me', authenticateToken, AuthController.getProfile);

    return router;
  }
}