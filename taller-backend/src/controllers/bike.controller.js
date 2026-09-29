import { BikeService } from "../services/bike.service.js";
import { BadRequestError } from "../utils/errors.js";

export class BikeController {
    // 1. Buscar motos por placa exacta (e información del propietario)
    // Ruta sugerida: GET /api/v1/bikes/placa/:placa
    static async findByPlaca(req, res, next) {
        try {
            const { placa } = req.params;
            if (!placa) {
                throw new BadRequestError("La placa es requerida.");
            }
            const bike = await BikeService.findByPlaca(placa);
            return res.success(bike, "Motocicleta obtenida exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 2. Buscar motos por ID
    // Ruta sugerida: GET /api/v1/bikes/:id
    static async findById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new BadRequestError("El ID es requerido.");
            }
            const bike = await BikeService.findById(id);
            return res.success(bike, "Motocicleta obtenida exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 3. Crear nueva moto
    // Ruta sugerida: POST /api/v1/bikes
    static async create(req, res, next) {
        try {
            const { placa, brand, model, cylinder, client_id } = req.body;
            if (!placa || !brand || !model || !client_id) {
                throw new BadRequestError("Todos los campos son requeridos.");
            }
            const newBike = await BikeService.create({ placa, brand, model, cylinder, client_id });
            return res.created(newBike, "Motocicleta creada exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 4. Listar todas las motos
    // Ruta sugerida: GET /api/v1/bikes
    static async getAll(_req, res, next) {
        try {
            const bikes = await BikeService.findAll();
            return res.success(bikes, "Motocicletas obtenidas exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    //5. Obtener todas las motos de un cliente específico
    // Ruta sugerida: GET /api/v1/bikes/client/:clientId
    static async getBikesByClient(req, res, next) {
        try {
            const { clientId } = req.params;
            if (!clientId) {
                throw new BadRequestError("El ID del cliente es requerido.");
            }
            const bikes = await BikeService.findByClientId(clientId);
            return res.success(bikes, "Motocicletas obtenidas exitosamente.");
        } catch (error) {
            next(error);
        }
    }

}