import { pool } from "../config/db.js";

export class BikeModel {
    //1. Buscar motos por placa exacta y (información de propietario))
    static async findByPlaca(placa) {
        const [rows] = await pool.query(
            `SELECT 
            b.id,
            b.placa,
            b.brand,
            b.model,
            b.cylinder,
            b.client_id,
            b.created_at,
            b.updated_at,
            c.name AS client_name,
            c.document_number AS client_document,
            c.phone AS client_phone,
            c.email AS client_email
            FROM bikes b
            INNER JOIN clients c ON b.client_id = c.id
            WHERE b.placa = ?`,
            [placa]
        );
        return rows[0] || null; 
    }

    //2. Buscar motos por ID
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT 
            b.id,
            b.placa,
            b.brand,
            b.model,
            b.cylinder,
            b.client_id,
            b.created_at,
            b.updated_at,
            c.name AS client_name,
            c.document_number AS client_document,
            c.phone AS client_phone,
            c.email AS client_email
            FROM bikes b
            INNER JOIN clients c ON b.client_id = c.id
            WHERE b.id = ?`,
            [id]
        );
        return rows[0] || null; 
    }

    //3. Crear nueva moto
    static async create(bikeData) {
        const { placa, brand, model, cylinder, client_id } = bikeData;
        const [result] = await pool.query(
            `INSERT INTO bikes (placa, brand, model, cylinder, client_id) VALUES (?, ?, ?, ?, ?)`,
            [placa, brand, model, cylinder, client_id]
        );
        return result.insertId; 
    }   

    //4. Listar todas las motos con información del propietario
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT
            b.id,
            b.placa,
            b.brand,
            b.model,
            b.cylinder,
            b.client_id,
            b.created_at,
            b.updated_at,
            c.name AS client_name,
            c.document_number AS client_document,
            c.phone AS client_phone,
            c.email AS client_email
            FROM bikes b
            INNER JOIN clients c ON b.client_id = c.id`
        );
        return rows; 
    }

    //5. listar motos por ID de cliente
    static async findByClientId(clientId) {
        const [rows] = await pool.query(
            `SELECT id, placa, brand, model, cylinder, client_id, created_at, updated_at
            FROM bikes
            WHERE client_id = ?`,
            [clientId]
        );
        return rows; 
    }
}    
    