import { WorkOrderModel } from '../models/work_order.model.js';
import { WorkOrderItemModel } from '../models/work_order_item.model.js';
import { BikeModel } from '../models/bike.model.js';
import { WorkOrderStatusHistoryModel } from '../models/work_order_status_history.model.js';

import {
  NotFoundError,
  BadRequestError,
  InvalidStateTransitionError,
  PendingItemsError,
  OrderClosedError,
  ForbiddenError
} from '../utils/errors.js';

// Mapa de transiciones permitidas
// El estado actual apunta a los estados siguientes válidos.
const ALLOWED_TRANSITIONS = {
  RECIBIDA: ['DIAGNOSTICO', 'CANCELADA'],
  DIAGNOSTICO: ['EN_REPARACION', 'CANCELADA'],
  EN_REPARACION: ['LISTA', 'CANCELADA'],
  LISTA: ['ENTREGADA', 'CANCELADA'],
  ENTREGADA: [],
  CANCELADA: []
};

export class WorkOrderService {
  // 1. Crear una nueva orden
  static async createOrder({ bike_id, fault_description }) {
    if (!bike_id || !fault_description) {
      throw new BadRequestError(
        'El ID de la moto y la descripción de la falla son requeridos.'
      );
    }

    const bike = await BikeModel.findById(bike_id);
    if (!bike) {
      throw new NotFoundError('La motocicleta especificada no existe.');
    }

    const orderId = await WorkOrderModel.create({ bike_id, fault_description });
    return await WorkOrderModel.findById(orderId);
  }

  // 2. Obtener orden por ID con sus items
  static async getOrderById(id) {
    const order = await WorkOrderModel.findById(id);
    if (!order) {
      throw new NotFoundError('La orden de trabajo no existe.');
    }

    const items = await WorkOrderItemModel.findByWorkOrderId(id);
    return { ...order, items };
  }

  // 3. Listar todas las ordenes
  static async getAllOrders() {
    return await WorkOrderModel.findAll();
  }

  // 4. Buscar por placa de moto
  static async getOrdersByPlaca(placa) {
    if (!placa) {
      throw new BadRequestError('La placa es requerida.');
    }

    return await WorkOrderModel.findByPlaca(placa.trim().toUpperCase());
  }

  // 5. Cambiar estado de la orden
  static async updateOrderStatus(id, newStatus, user, note = null) {
    const order = await WorkOrderModel.findById(id);
    if (!order) {
      throw new NotFoundError('La orden de trabajo no existe.');
    }

    if (!newStatus) {
      throw new BadRequestError('El nuevo estado es requerido.');
    }

    if (!note || !String(note).trim()) {
      throw new BadRequestError('La nota del cambio de estado es requerida.');
    }

    const previousStatus = order.status;

    // RN-03: No se puede mutar una orden cerrada
    if (order.status === 'ENTREGADA' || order.status === 'CANCELADA') {
      throw new OrderClosedError(
        'La orden se encuentra finalizada o cancelada y no admite cambios.'
      );
    }

    // RN-01: Validar que el estado nuevo esté permitido desde el estado actual
    const validNextStates = ALLOWED_TRANSITIONS[order.status] || [];
    if (!validNextStates.includes(newStatus)) {
      throw new InvalidStateTransitionError(
        `Transición no permitida: ${order.status} -> ${newStatus}`
      );
    }

    // RN-04: Solo ADMIN puede cerrar o cancelar
    if ((newStatus === 'ENTREGADA' || newStatus === 'CANCELADA') && user?.role !== 'ADMIN') {
      throw new ForbiddenError(
        'Requiere privilegios de Administrador para cerrar o cancelar la orden.'
      );
    }

    // RN-02: Si va a ENTREGADA, debe haber al menos un item
    if (newStatus === 'ENTREGADA') {
      const items = await WorkOrderItemModel.findByWorkOrderId(id);

      if (!items || items.length === 0) {
        throw new PendingItemsError(
          'No se puede entregar la orden porque no tiene ítems registrados.'
        );
      }
    }

    await WorkOrderModel.updateStatus(id, newStatus);

    await WorkOrderStatusHistoryModel.create({
      work_order_id: id,
      from_status: previousStatus,
      to_status: newStatus,
      note: String(note).trim(),
      changed_by_user_id: user?.id
    });

    return await this.getOrderById(id);
  }

  // 6. Agregar item a la orden
  static async addItemToOrder(workOrderId, itemData, user) {
    const { type, description, count, unit_value } = itemData;

    if (!type || !description || !count || unit_value === undefined) {
      throw new BadRequestError('Todos los campos del ítem son requeridos.');
    }

    const order = await WorkOrderModel.findById(workOrderId);
    if (!order) {
      throw new NotFoundError('La orden de trabajo no existe.');
    }

    if (order.status === 'ENTREGADA' || order.status === 'CANCELADA') {
      throw new OrderClosedError(
        'La orden se encuentra finalizada o cancelada y no admite cambios.'
      );
    }

    await WorkOrderItemModel.create({
      work_order_id: workOrderId,
      type,
      description,
      count,
      unit_value,
      created_by_user_id: user.id
    });

    const newTotal = await WorkOrderItemModel.calculateTotalByWorkOrderId(workOrderId);
    await WorkOrderModel.updateTotal(workOrderId, newTotal);

    return await this.getOrderById(workOrderId);
  }

  // 8. Obtener historial de cambios de estado de una orden
  static async getHistory(workOrderId) {
    const order = await WorkOrderModel.findById(workOrderId);
    if (!order) {
      throw new NotFoundError('La orden de trabajo no existe.');
    }

    const history = await WorkOrderStatusHistoryModel.findByWorkOrderId(workOrderId);
    return history;
  }

  // 7. Eliminar item
  static async removeItemFromOrder(workOrderId, itemId) {
    const order = await WorkOrderModel.findById(workOrderId);
    if (!order) {
      throw new NotFoundError('La orden de trabajo no existe.');
    }

    if (order.status === 'ENTREGADA' || order.status === 'CANCELADA') {
      throw new OrderClosedError(
        'La orden se encuentra finalizada o cancelada y no admite cambios.'
      );
    }

    const item = await WorkOrderItemModel.findById(itemId);
    if (!item || item.work_order_id !== Number(workOrderId)) {
      throw new NotFoundError('El ítem especificado no pertenece a esta orden.');
    }

    await WorkOrderItemModel.deleteById(itemId);

    const newTotal = await WorkOrderItemModel.calculateTotalByWorkOrderId(workOrderId);
    await WorkOrderModel.updateTotal(workOrderId, newTotal);

    return await this.getOrderById(workOrderId);
  }
}