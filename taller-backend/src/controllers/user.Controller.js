import { UserService } from "../services/user.service.js";
import { BadRequestError } from "../utils/errors.js";


export class UserController {
    // 1. Registrar un nuevo usuario
    static async registerUser(req, res, next) {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password) {
                throw new BadRequestError("Faltan campos obligatorios.");
            }
            const newUser = await UserService.registerUser({ name, email, password, role });
            return res.created(newUser,"Usuario registrado exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 2. Obtener todos los usuarios
    static async getAllUsers(_req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            return res.success(users, "Usuarios obtenidos exitosamente.");
        } catch (error) {
            next(error);
        }
    }

    // 3. Obtener un usuario por su ID sin contraseña
    static async getUserByIdWithoutPassword(req, res, next) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserByIdWithoutPassword(id);
            return res.success(user, "Usuario obtenido exitosamente.");
        }
        catch (error) {
            next(error);
        }
    }

    // 4. Actualizar datos básicos (Nombre, Email, Rol)
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, role } = req.body;
            const updatedUser = await UserService.updateUser(id, { name, email, role });
            return res.success(updatedUser, "Usuario actualizado exitosamente.");
        }
        catch (error) {
            next(error);
        }
    }

    // 5. Cambiar / Actualizar contraseña
    static async changePassword(req, res, next) {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new BadRequestError('La nueva contraseña es obligatoria');
            }
            const result = await UserService.changePassword(id, { currentPassword, newPassword });
            return res.success(null, result.message);
        }
        catch (error) {
            next(error);
        }
    }

    // 6. Activar/Desactivar usuario
    static async toggleUserStatus(req, res, next) {
        try {
            const { id } = req.params;

            const result = await UserService.toggleUserStatus(id);

           return res.success(null, result.message);
        }
        catch (error) {
            next(error);
        }
    }
}