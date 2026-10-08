import { WorkOrderService } from '../services/work_order.service.js';
import { BadRequestError } from '../utils/errors.js';

export class WorkOrderController {
  static async createOrder(req, res, next) {
    try {
      const { bike_id, fault_description } = req.body;

      if (!bike_id || !fault_description) {
        throw new BadRequestError('El ID de la moto y la descripción de la falla son requeridos.');
      }

      const order = await WorkOrderService.createOrder({ bike_id, fault_description });
      return res.created(order, 'Orden de trabajo creada exitosamente.');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('El ID es requerido.');
      }

      const order = await WorkOrderService.getOrderById(id);
      return res.success(order, 'Orden de trabajo obtenida exitosamente.');
    } catch (error) {
      next(error);
    }
  }

  static async getAllOrders(_req, res, next) {
    try {
      const orders = await WorkOrderService.getAllOrders();
      return res.success(orders, 'Órdenes de trabajo obtenidas exitosamente.');
    } catch (error) {
      next(error);
    }
  }

  static async getOrdersByPlaca(req, res, next) {
    try {
      const { placa } = req.params;

      if (!placa) {
        throw new BadRequestError('La placa es requerida.');
      }

      const orders = await WorkOrderService.getOrdersByPlaca(placa);
      return res.success(orders, 'Órdenes encontradas por placa exitosamente.');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderHistory(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('El ID es requerido.');
      }

      const history = await WorkOrderService.getHistory(id);
      return res.success(history, 'Historial de la orden obtenido exitosamente.');
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!id) {
        throw new BadRequestError('El ID de la orden es requerido.');
      }

      if (!status) {
        throw new BadRequestError('El nuevo estado es requerido.');
      }

      if (!note || !String(note).trim()) {
        throw new BadRequestError('La nota del cambio de estado es requerida.');
      }

      const user = req.user; // { id, role, ... }
      const updatedOrder = await WorkOrderService.updateOrderStatus(id, status, user, note);
      return res.success(updatedOrder, 'Estado de la orden actualizado exitosamente.');
    } catch (error) {
      next(error);
    }
  }

  static async addItemToOrder(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('El ID de la orden es requerido.');
      }

      const itemData = req.body;
      const updatedOrder = await WorkOrderService.addItemToOrder(id, itemData, req.user);
      return res.created(updatedOrder, 'Ítem agregado a la orden exitosamente.');
    } catch (error) {
      next(error);
    }
  }

  static async removeItemFromOrder(req, res, next) {
    try {
      const { id, itemId } = req.params;

      if (!id || !itemId) {
        throw new BadRequestError('El ID de la orden y del ítem son requeridos.');
      }

      const updatedOrder = await WorkOrderService.removeItemFromOrder(id, itemId);
      return res.success(updatedOrder, 'Ítem eliminado de la orden exitosamente.');
    } catch (error) {
      next(error);
    }
  }
}
