import { Router } from 'express';
import { BikeController } from '../controllers/bike.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

export class BikeRoutes {
  static get routes() {
    const router = Router();

    // 1. AUTENTICACIÓN GLOBAL: Requiere token JWT válido
    router.use(authenticateToken);

    // 2. AUTORIZACIÓN: Solo usuarios con rol ADMIN 
    router.use(authorizeRoles('ADMIN'));

    // Rutas específicas (van antes que /:id para evitar colisión de rutas)
    router.get('/placa/:placa', BikeController.findByPlaca);
    router.get('/client/:clientId', BikeController.getBikesByClient);

    // Rutas raíz /api/v1/bikes
    router
      .route('/')
      .get(BikeController.getAll)
      .post(BikeController.create);

    // Ruta por ID /api/v1/bikes/:id
    router
      .route('/:id')
      .get(BikeController.findById);

    return router;
  }
}