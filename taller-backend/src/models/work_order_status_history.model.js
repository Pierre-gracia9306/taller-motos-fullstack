import { pool } from '../config/db.js';

export class WorkOrderStatusHistoryModel {
  // Obtener historial por orden de trabajo, con nombre del usuario que realizó el cambio
  static async findByWorkOrderId(work_order_id) {
    const [rows] = await pool.query(
      `SELECT 
        h.id,
        h.work_order_id,
        h.from_status,
        h.to_status,
        h.note,
        h.changed_by_user_id,
        u.name AS changed_by_user_name,
        h.created_at
       FROM work_order_status_history h
       LEFT JOIN users u ON h.changed_by_user_id = u.id
       WHERE h.work_order_id = ?
       ORDER BY h.created_at DESC`,
      [work_order_id]
    );
    return rows;
  }

  // Registrar un nuevo cambio de estado
  static async create({ work_order_id, from_status = null, to_status, note = null, changed_by_user_id }) {
    const result = await pool.query(
      `INSERT INTO work_order_status_history (work_order_id, from_status, to_status, note, changed_by_user_id) VALUES (?,?,?,?,?)`,
      [work_order_id, from_status, to_status, note, changed_by_user_id]
    );
    return result.insertId;
  }
}
