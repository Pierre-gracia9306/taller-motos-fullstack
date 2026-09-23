import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

export class ClientRoutes {
  static get routes() {
    const router = Router();

    // 1. AUTENTICACIÓN GLOBAL: Requiere token JWT válido para todas las rutas de clientes
    router.use(authenticateToken);

    // 2. AUTORIZACIÓN: Módulo exclusivo para administradores
    router.use(authorizeRoles('ADMIN'));

    // Búsqueda flexible (/clients/search?q=texto o ?query=texto)
    // NOTA: Debe ir ANTES de /:id para evitar que Express interprete 'search' como si fuera un ID.
    router.get('/search', ClientController.searchClients);

    // Rutas principales del CRUD
    router.route('/')
      .get(ClientController.getAllClients)
      .post(ClientController.createClient);

    router.route('/:id')
      .get(ClientController.getClientById)
      .put(ClientController.updateClient)
      .patch(ClientController.partialUpdateClient)
      .delete(ClientController.deleteClient);

    return router;
  }
}