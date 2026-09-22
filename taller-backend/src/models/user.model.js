import { pool } from "../config/db.js";

export class UserModel {
    //Buscar usuario por el email para el login 
    static async findByEmail(email){
        const query = `
        SELECT id, name, email, password_hash, role, active, created_at 
        FROM users
        WHERE email= ?
        ` ;
        const [rows]= await pool.execute (query,[email]);
        return rows[0] || null
    }

    //Buscar usaurio por el ID, para validar el token en peticiones autenticadas
    static async findById(id){
        const query = `
        SELECT id, name, email, password_hash, role, active, created_at
        FROM users
        WHERE id= ?
        `;
        const [rows]= await pool.execute(query,[id]);
        return rows[0] || null
    }
    //Buscar usuarios por el id sin el password_hash, para mostrar en el panel de administracion
    static async findByIdWithoutPassword(id){
        const query = `
        SELECT id, name, email, role, active, created_at
        FROM users
        WHERE id= ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    }

    //Buscar todos los usuarios, para mostrar en el panel de administracion
    static async findAll(){
        const query = `
        SELECT id, name, email, role, active, created_at
        FROM users
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    //Crear un nuevo usuario, para registrar administradores y/o usuarios
    static async create({name, email, password_hash, role='MECANICO'}){
        const query = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES(?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query,[name,email, password_hash, role]);
        return {
            id: result.insertId,
            name,
            email,
            role
        };
    }

    //Actualizar un usuario, para actualizar datos de administradores y/o usuarios
    static async update(id, {name, email, password_hash, role, active}){
        const query = `
        UPDATE users
        SET name= ?, email= ?, password_hash= ?, role= ?, active= ?
        WHERE id= ?
        `;
        const [result] = await pool.execute(query,[name, email, password_hash, role, active, id]);  
        return result.affectedRows > 0;
    }

    //Eliminacion logica de un usuario, para desactivar administradores y/o usuarios
    static async toggleActive(id, active){
        const query = `
        UPDATE users
        SET active= ?
        WHERE id= ?
        `;
        const [result] = await pool.execute(query,[active, id]);
        return result.affectedRows > 0;
    }

    // Cambiar la contraseña de un usuario, para actualizar la contraseña de administradores y/o usuarios
    static async updatePassword(id, password_hash) {
        const query = `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        `;
        const [result] = await pool.execute(query, [password_hash, id]);
        return result.affectedRows > 0;
    }   
}

