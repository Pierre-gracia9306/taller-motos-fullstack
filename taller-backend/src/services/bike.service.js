import { BikeModel } from "../models/bike.model.js";
import { ClientModel } from "../models/client.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

export class BikeService {
    // 1. Buscar motos por placa exacta (e información del propietario)
    static async findByPlaca(placa) {
        const formattedPlaca = placa.trim().toUpperCase();
        const bike = await BikeModel.findByPlaca(formattedPlaca);

        if (!bike) {
            throw new NotFoundError(`No se encontró ninguna motocicleta con la placa '${formattedPlaca}'`);
        }

        return bike;
    }

    // 2. Buscar motos por ID
    static async findById(id) {
        const bike = await BikeModel.findById(id);

        if (!bike) {
            throw new NotFoundError(`No se encontró la motocicleta con ID ${id}`);
        }

        return bike;
    }

    // 3. Crear nueva moto
    static async create(bikeData) {
        const { placa, brand, model, cylinder, client_id } = bikeData;

        // 3.1 Normalizar la placa a mayúsculas y sin espacios
        const formattedPlaca = placa.trim().toUpperCase();

        // 3.2 Verificar si la placa ya existe (RN-07)
        const existingBike = await BikeModel.findByPlaca(formattedPlaca);
        if (existingBike) {
            throw new ConflictError(`La motocicleta con la placa '${formattedPlaca}' ya está registrada`);
        }

        // 3.3 Validar que el cliente exista
        const client = await ClientModel.findById(client_id);
        if (!client) {
            throw new NotFoundError(`El cliente con ID ${client_id} no existe`);
        }

        // 3.4 Registrar la nueva moto
        const newBikeId = await BikeModel.create({
            placa: formattedPlaca,
            brand: brand.trim(),
            model: model.trim(),
            cylinder: cylinder ? cylinder.trim() : null,
            client_id,
        });

        return await BikeModel.findById(newBikeId);
    }

    // 4. Actualizar una moto existente
    static async updateBike(id, bikeData) {
        const existingBike = await BikeModel.findById(id);
        if (!existingBike) {
            throw new NotFoundError(`No se encontró la motocicleta con ID ${id}`);
        }

        const { placa, brand, model, cylinder, client_id } = bikeData;
        const formattedPlaca = placa.trim().toUpperCase();

        const bikeWithSamePlate = await BikeModel.findByPlaca(formattedPlaca);
        if (bikeWithSamePlate && Number(bikeWithSamePlate.id) !== Number(id)) {
            throw new ConflictError(`La motocicleta con la placa '${formattedPlaca}' ya está registrada`);
        }

        const client = await ClientModel.findById(client_id);
        if (!client) {
            throw new NotFoundError(`El cliente con ID ${client_id} no existe`);
        }

        const updated = await BikeModel.update(id, {
            placa: formattedPlaca,
            brand: brand.trim(),
            model: model.trim(),
            cylinder: cylinder ? cylinder.trim() : null,
            client_id,
        });

        if (!updated) {
            throw new NotFoundError(`No se pudo actualizar la motocicleta con ID ${id}`);
        }

        return await BikeModel.findById(id);
    }

    // 5. Listar todas las motos 
    static async findAll() {
        return await BikeModel.findAll();
    }

    // 6. Obtener todas las motos de un cliente específico
    static async findByClientId(client_id) {
        // 6.1 Validar que el cliente exista
        const client = await ClientModel.findById(client_id);
        if (!client) {
            throw new NotFoundError(`El cliente con ID ${client_id} no existe`);
        }

        return await BikeModel.findByClientId(client_id);
    }
}