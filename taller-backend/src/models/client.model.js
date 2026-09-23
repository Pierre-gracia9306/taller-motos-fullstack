import pool from '../database/db.js';

export class ClientModel {
    //1. Metodo para buscar un cliente por id.
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, name, document_number, phone, email, created_at, updated_at FROM clients WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    //2. Método para buscar un cliente por número de documento exacto (Validación de duplicados).
    static async findByDocument(document_number) {
        const [rows] = await pool.execute(
            'SELECT id, name, document_number, phone, email, created_at, updated_at FROM clients WHERE document_number = ?',
            [document_number]
        );
        return rows[0] || null;
    }

    //3. Metodo Busqueda Flexible de clientes por nombre o numero de documento.
    static async search(query) {
        const searchPattern = `%${query}%`;
        const [rows] = await pool.execute(
            'SELECT id, name, document_number, phone, email, created_at FROM clients WHERE document_number LIKE ? OR name LIKE ? LIMIT 20',
        [searchPattern, searchPattern]
        );
        return rows ;
    }

    //4. Metodo para listar todos los clientes.
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, name, document_number, phone, email, created_at, updated_at FROM clients'
        );
        return rows;
    }

    //5. Metodo para crear un nuevo cliente.
    static async create({ name, document_number, phone, email }) {
        const [result] = await pool.execute(
            'INSERT INTO clients (name, document_number, phone, email) VALUES (?, ?, ?, ?)',
            [name, document_number, phone, email]
        );
        return result.insertId;
    }

    //6. Metodo para actualizar un cliente existente (PUT).
    static async update(id, { name, document_number, phone, email }) {
        const [result] = await pool.execute(
            'UPDATE clients SET name = ?, document_number = ?, phone = ?, email = ? WHERE id = ?',
            [name, document_number, phone, email, id]
        );
        return result.affectedRows > 0;
    }

    //7. Metodo para actualizar parcialmente un cliente existente(PATCH).
    static async updatePartial(id, fieldsUpdate) {
        const setClause = Object.keys(fieldsUpdate)
        if (setClause.length === 0) {
            return false; // No hay campos para actualizar
        }
        const setClauseString = setClause.map(field => `${field} = ?`).join(', ');
        const values = Object.values(fieldsUpdate);

        const [result] = await pool.execute(
            `UPDATE clients SET ${setClauseString} WHERE id = ?`,
            [...values, id]
        );
        return result.affectedRows > 0;
    }

    //8. Metodo para eliminar un cliente.
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM clients WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}