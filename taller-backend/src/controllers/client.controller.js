import { ClientService } from "../services/client.service.js";
import { BadRequestError } from "../utils/errors.js";

export class ClientController { 
    // 1. Obtener todos los clientes
    static async getAllClients(_req, res, next) {
        try {
            const clients = await ClientService.getAllClients();
            return res.success(clients, "Clientes obtenidos exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 2. Obtener un cliente por su ID
    static async getClientById(req, res, next) {
        try {
            const { id } = req.params;
            const client = await ClientService.getClientById(id);
            return res.success(client, "Cliente obtenido exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 3. Búsqueda flexible (por query parameter: /clients/search?q=texto)
    static async searchClients(req, res, next) {
        try {
            // Se extrae la propiedad query (o q) según cómo la envíe el cliente
            const query = req.query.query || req.query.q || '';
            const clients = await ClientService.searchClients(query);
            return res.success(clients, "Clientes encontrados exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 4. Crear un nuevo cliente
    static async createClient(req, res, next) {
        try {
            const { name, document_number, phone, email } = req.body;
            if (!name || !document_number || !phone || !email) {
                throw new BadRequestError("Faltan campos obligatorios.");
            }
            const newClient = await ClientService.createClient({ name, document_number, phone, email });
            return res.created(newClient, "Cliente creado exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 5. Actualizar datos completos de un cliente (PUT)
    static async updateClient(req, res, next) {
        try {
            const { id } = req.params;
            const { name, document_number, phone, email } = req.body;
            if (!name || !document_number || !phone || !email) {
                throw new BadRequestError("Faltan campos obligatorios.");
            }
            const updatedClient = await ClientService.updateClient(id, { name, document_number, phone, email });
            return res.success(updatedClient, "Cliente actualizado exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 6. Actualización parcial de datos de un cliente (PATCH)
    static async partialUpdateClient(req, res, next) {
        try {
            const { id } = req.params;
            const fieldsToUpdate = req.body;

            if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
                throw new BadRequestError("Debe enviar al menos un campo para actualizar.");
            }

            const updatedClient = await ClientService.updatePartialClient(id, fieldsToUpdate);
            return res.success(updatedClient, "Cliente actualizado parcialmente exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 7. Eliminar un cliente
    static async deleteClient(req, res, next) {
        try {
            const { id } = req.params;
            await ClientService.deleteClient(id);
            return res.success(null, "Cliente eliminado exitosamente.");
        } catch (error) {
            next(error);
        }
    } 
}