import bcrypt from 'bcryptjs';
import { pool } from './src/config/db.js';

const createInitialAdmin = async () => {
  try {
    const email = 'admin@taller.com';
    const passwordPlana = 'Admin123*';
    const name = 'Jean Pierre Gracia';
    const role = 'ADMIN';

    // 1. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlana, salt);

    // 2. Insertar directamente en la base de datos
    const query = `
      INSERT INTO users (name, email, password_hash, role, active)
      VALUES (?, ?, ?, ?, true)
      ON DUPLICATE KEY UPDATE role = 'ADMIN';
    `;

    await pool.execute(query, [name, email, passwordHash, role]);

    console.log('✅ Usuario ADMIN inicial creado con éxito:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${passwordPlana}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el ADMIN inicial:', error.message);
    process.exit(1);
  }
};

createInitialAdmin();