import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './src/config/db.js';

const createInitialAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@taller.com';
    const passwordPlana = process.env.ADMIN_PASSWORD || 'Admin123*';
    const name = 'Jean Pierre Gracia';
    const role = 'ADMIN';

    // 1. Encriptar la contraseña con salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlana, salt);

    // 2. Insertar o actualizar si el correo ya existe
    const query = `
      INSERT INTO users (name, email, password_hash, role, active)
      VALUES (?, ?, ?, ?, true)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        password_hash = VALUES(password_hash),
        role = 'ADMIN',
        active = true;
    `;

    await pool.execute(query, [name, email, passwordHash, role]);

    console.log('✅ Usuario ADMIN inicial creado/actualizado con éxito:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${passwordPlana}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el ADMIN inicial:', error.message);
    process.exit(1);
  }
};

createInitialAdmin();