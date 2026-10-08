import { pool } from "../config/db.js";

export class WorkOrderModel {
    //1. Método para crear una nueva orden de trabajo
    static async create({bike_id, fault_description}) {
        const result = await pool.query(
            'INSERT INTO work_orders (bike_id, fault_description) VALUES (?,?)',
            [bike_id, fault_description]
        );
        return result.insertId;
    }

    //2. Metodo para buscar una orden por su ID, con detalle de la moto y el cliente
    static async findById(id) {
    const [rows] = await pool.query(
      `SELECT 
        wo.id,
        wo.bike_id,
        wo.entry_date,
        wo.fault_description,
        wo.status,
        wo.total,
        wo.created_at,
        wo.updated_at,
        b.placa,
        b.brand,
        b.model,
        b.cylinder,
        c.id AS client_id,
        c.name AS client_name,
        c.document_number AS client_document,
        c.phone AS client_phone,
        c.email AS client_email
       FROM work_orders wo
       INNER JOIN bikes b ON wo.bike_id = b.id
       INNER JOIN clients c ON b.client_id = c.id
       WHERE wo.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  //3. Metodo lista todas las ordenes de trabajo con detalle de la moto y el cliente
   static async findAll() {
    const [rows] = await pool.query(
      `SELECT 
        wo.id,
        wo.bike_id,
        wo.entry_date,
        wo.fault_description,
        wo.status,
        wo.total,
        wo.created_at,
        wo.updated_at,
        b.placa,
        b.brand,
        b.model,
        c.name AS client_name,
        c.document_number AS client_document
       FROM work_orders wo
       INNER JOIN bikes b ON wo.bike_id = b.id
       INNER JOIN clients c ON b.client_id = c.id
       ORDER BY wo.created_at DESC`
    );
    return rows;
  }

  // 4. Actualizar el estado de la orden (Uso directo tras validar RN-01, RN-02, RN-04)
  static async updateStatus(id, newStatus) {
    const [result] = await pool.query(
      `UPDATE work_orders 
       SET status = ? 
       WHERE id = ?`,
      [newStatus, id]
    );
    return result.affectedRows > 0;
 }

 // 5. Actualizar el total calculado de la orden de trabajo
  static async updateTotal(id, total) {
    const [result] = await pool.query(
      `UPDATE work_orders 
       SET total = ? 
       WHERE id = ?`,
      [total, id]
    );
    return result.affectedRows > 0;
  }

  // 6. Obtener historial de órdenes asociadas directamente a la placa de una motocicleta
  static async findByPlaca(placa) {
    const [rows] = await pool.query(
      `SELECT 
        wo.id,
        wo.bike_id,
        wo.entry_date,
        wo.fault_description,
        wo.status,
        wo.total,
        wo.created_at,
        wo.updated_at,
        b.placa,
        b.brand,
        b.model,
        c.name AS client_name
       FROM work_orders wo
       INNER JOIN bikes b ON wo.bike_id = b.id
       INNER JOIN clients c ON b.client_id = c.id
       WHERE b.placa = ?
       ORDER BY wo.created_at DESC`,
      [placa]
    );
    return rows;
  }
}






