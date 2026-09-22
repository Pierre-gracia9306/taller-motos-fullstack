import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { NotFoundError } from './utils/errors.js';

import { AuthRoutes } from './routes/auth.routes.js';
import { UserRoutes } from './routes/user.routes.js';

const app = express();

// 1. Middlewares de nivel de aplicación
app.use(cors({
    origin: env?.clientUrl || process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 2. Ruta de verificación de estados (Health Check)
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'API del Taller de Motocicletas funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// 3. Rutas de la API 
const apiRouter = express.Router();

apiRouter.use('/auth', AuthRoutes.routes);
apiRouter.use('/users', UserRoutes.routes);

app.use('/api/v1', apiRouter);

// 4. Manejo de rutas inexistentes (404 Not Found)
app.use((req, _res, next) => {
    next(new NotFoundError(`La ruta ${req.originalUrl} no existe en este servidor`));
});

// 5. Middleware Global de errores (Debe ir al final de la cadena)
app.use(errorHandler);

export default app;