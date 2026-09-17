import app from './app.js';
import {env} from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';

const startServer = async () => {
    // 1. Validar la conexion a la base  de datos antes de levantar la API
    await checkDatabaseConnection();

    //2. Instalar el servidor HTTP
    app.listen(env.port, ()=> {
        console.log(`🚀 Servidor ejecutándose en el puerto ${env.port}`);
        console.log(`🌍 Ambientes configurados correctamente para taller_db`);
    });
};

startServer();