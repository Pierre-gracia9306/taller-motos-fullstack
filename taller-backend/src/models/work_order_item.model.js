import { pool } from '../config/db.js';

export class WorkOrderItemModel {
    //1. Método para registrar un nuevo item de orden de trabajo(Respuesto o Mano de obra)
    static async create({work_order_id, type, description, count, unit_value, created_by_user_id}) {
        const result = await pool.query(
            'INSERT INTO work_order_items (work_order_id, type, description, count, unit_value, created_by_user_id) VALUES (?,?,?,?,?,?)',
            [work_order_id, type, description, count, unit_value, created_by_user_id]
        );
        return result.insertId;
    }

    //2. Método para obtener todos los items de una orden de trabajo
   static async findByWorkOrderId(work_order_id) {
    const [rows] = await pool.query(
      `SELECT 
        woi.id,
        woi.work_order_id,
        woi.type,
        woi.description,
        woi.count,
        woi.unit_value,
        (woi.count * woi.unit_value) AS subtotal,
        woi.created_by_user_id,
        u.name AS created_by_user_name,
        woi.created_at
       FROM work_order_items woi
       INNER JOIN users u ON woi.created_by_user_id = u.id
       WHERE woi.work_order_id = ?
       ORDER BY woi.created_at ASC`,
      [work_order_id]
    );
    return rows;
  }

  //3. Método para obtener un item de orden de trabajo por su ID
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT id, work_order_id, type, description, count, unit_value, created_at
             FROM work_order_items
             WHERE id = ?`,
            [id]
        );
        return rows[0]|| null;
    }

   //4. Método para eliminar un item de orden de trabajo por su ID
    static async deleteById(id) {
        const result = await pool.query(
            'DELETE FROM work_order_items WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

   //5. Método para calcular el total de los items de una orden de trabajo
    static async calculateTotalByWorkOrderId(work_order_id) {
        const [rows] = await pool.query(
            `SELECT SUM(count * unit_value) AS total
             FROM work_order_items
             WHERE work_order_id = ?`,
            [work_order_id]
        );
        return rows[0].total || 0;
    }

}