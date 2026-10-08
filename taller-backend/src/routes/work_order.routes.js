import { Router } from 'express';
import { WorkOrderController } from '../controllers/work_order.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export class WorkOrderRoutes {
  static get routes() {
    const router = Router();

    router.use(authenticateToken);

    router.get('/placa/:placa', WorkOrderController.getOrdersByPlaca);
    router.get('/:id/history', WorkOrderController.getOrderHistory);
    router.post('/:id/items', WorkOrderController.addItemToOrder);
    router.delete('/:id/items/:itemId', WorkOrderController.removeItemFromOrder);
    router.patch('/:id/status', WorkOrderController.updateOrderStatus);

    router
      .route('/')
      .get(WorkOrderController.getAllOrders)
      .post(WorkOrderController.createOrder);

    router
      .route('/:id')
      .get(WorkOrderController.getOrderById);

    return router;
  }
}
