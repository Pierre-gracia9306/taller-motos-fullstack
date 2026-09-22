import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ForbiddenError } from '../utils/errors.js';

export class UserRoutes {
  static get routes() {
    const router = Router();

    // 1. AUTENTICACIÓN GLOBAL: Requiere token JWT válido para todas las rutas de usuarios
    router.use(authenticateToken);

    // Permite cambiar la contraseña solo si es el propio usuario o si es ADMIN
    router.patch(
      '/:id/change-password',
      (req, _res, next) => {
        const isOwner = String(req.user.id) === String(req.params.id);
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
          return next(new ForbiddenError('No tiene permisos para modificar la contraseña de otro usuario'));
        }
        next();
      },
      UserController.changePassword
    );

    // A partir de aquí, todas las rutas subsecuentes requieren el rol ADMIN
    router.use(authorizeRoles('ADMIN'));

    // CRUD completo de usuarios
    router.route('/')
      .get(UserController.getAllUsers)
      .post(UserController.registerUser);

    router.route('/:id')
      .get(UserController.getUserByIdWithoutPassword)
      .put(UserController.updateUser);

    router.patch('/:id/status', UserController.toggleUserStatus);

    return router;
  }
}