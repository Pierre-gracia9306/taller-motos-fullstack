import { ClientModel } from "../models/client.model.js";
import { ConflictError, NotFoundError } from '../utils/errors.js';

export class ClientService {
    // 1. Método para obtener todos los clientes
    static async getAllClients() {
        return await ClientModel.findAll();
    }

    // 2. Método para obtener un cliente por su ID
    static async getClientById(id) {
        const client = await ClientModel.findById(id);
        if (!client) {
            throw new NotFoundError(`Cliente con ID ${id} no encontrado`);
        }   
        return client;
    }

    // 3. Método para búsqueda flexible de clientes por nombre o número de documento
    static async searchClients(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        return await ClientModel.search(query.trim());
    }

    // 4. Método para crear un nuevo cliente con validación de duplicados por documento
    static async createClient(clientData) {
        const existingClient = await ClientModel.findByDocument(clientData.document_number);
        if (existingClient) {
            throw new ConflictError(`Cliente con número de documento ${clientData.document_number} ya existe`);
        }
        const newClientId = await ClientModel.create(clientData);
        return await ClientModel.findById(newClientId);
    }

    // 5. Actualizar un cliente existente completamente (PUT)
    static async updateClient(id, clientData) {
        await this.getClientById(id);
        
        const { document_number } = clientData;
        if (document_number) {
            const clienteWithDocument = await ClientModel.findByDocument(document_number);
            if (clienteWithDocument && clienteWithDocument.id !== Number(id)) {
                throw new ConflictError(`Cliente con número de documento ${document_number} ya existe`);
            }
        }

        await ClientModel.update(id, clientData);
        return await this.getClientById(id);
    }

    // 6. Actualizar parcialmente un cliente existente (PATCH)
    static async updatePartialClient(id, fieldsUpdate) {
        await this.getClientById(id);

        if (fieldsUpdate.document_number) {
            const clienteWithDocument = await ClientModel.findByDocument(fieldsUpdate.document_number); 
            if (clienteWithDocument && clienteWithDocument.id !== Number(id)) {
                throw new ConflictError(`Cliente con número de documento ${fieldsUpdate.document_number} ya existe`);
            }
        }

        const updated = await ClientModel.updatePartial(id, fieldsUpdate);
        if (!updated) {
            throw new NotFoundError(`Cliente con ID ${id} no encontrado para actualizar`);
        }

        return await this.getClientById(id); 
    }   

    // 7. Eliminar un cliente existente
    static async deleteClient(id) {
        await this.getClientById(id);
        return await ClientModel.delete(id);
    }
}