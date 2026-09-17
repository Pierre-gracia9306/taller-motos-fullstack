import dotenv from 'dotenv';

// 1. Cargar las variables del archivo .env en la memoria de Node.js (process.env)
dotenv.config();

// 2. Definir las variables necesarias para el sistema
const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'DB_PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN'
];

// 3. Validar que ninguna variable requerida esté ausente
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`[CONFIG ERROR] La variable de entorno ${varName} es obligatoria en el archivo .env`);
  }
});

// 4. Exportar un objeto inmutable con la configuración procesada
export const env = Object.freeze({
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  }
});