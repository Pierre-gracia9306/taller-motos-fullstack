import mysql from 'mysql2/promise';
import { env } from './env.js';

// 1. Crear el Pool de conexiones asíncronas
export const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  port: env.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2. Función de verificación de conectividad
export const checkDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos MySQL');
    connection.release(); // Libera la conexión de vuelta al pool
  } catch (error) {
    console.error('❌ Error crítico al conectar con la base de datos:', error.message);
    process.exit(1); // Detiene la aplicación si la base de datos no está disponible
  }
};