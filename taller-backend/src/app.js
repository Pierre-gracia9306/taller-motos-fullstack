import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';
import { NotFoundError } from './utils/errors.js';

import authRoutes from './routes/auth.routes.js';


const app = express();

// 1. Middlewares de nivel de aplicación
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

//2. Ruta de verificacion de estados (Health Check)
app.get('/health',(req,res) => {
    res.status(200).json(
        {
            status:'OK',
            message:'API del Taller de Motocicletas funcionando correctamente',
            timestamp: new Date().toISOString()
        }
    );
}
);
//3. Rutas de la API
const apiRouter = express.Router();
apiRouter.use('/api/v1/auth', authRoutes);


//4. Manejo de rutas inexistentes (404 Not Found)
app.use((req, res, next)=>{
    next(new NotFoundError(`La ruta ${req.originalUrl} no existe en este servidor`));
});


//5. Middleware Global de errores (Debe ir al final de la cadena)
app.use(errorHandler);

export default app;