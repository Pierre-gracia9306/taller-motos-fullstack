import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors.js";

export class UserService {
    
    // 1. Registrar un nuevo usuario
    static async registerUser({ name, email, password, role }) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("El correo electrónico ya está en uso.");
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            name,
            email,
            password_hash,
            role
        });

        return newUser;
    }

    // 2. Obtener todos los usuarios
    static async getAllUsers() {
        return await UserModel.findAll();
    }

    // 3. Obtener un usuario por su ID sin contraseña
    static async getUserByIdWithoutPassword(id) {
        const user = await UserModel.findByIdWithoutPassword(id);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado.");
        }
        return user;
    }

    // 4. Actualizar datos básicos (Nombre, Email, Rol)
    static async updateUser(id, { name, email, role }) {
        const user = await UserModel.findById(id);  
        if (!user) {
            throw new NotFoundError("Usuario no encontrado.");
        }

        //4.1 Validar si el email ya existe en otro usuario
        if (email && email !== user.email) {
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                throw new ConflictError("El correo electrónico ya está en uso.");
            }
        }

        const updatedUser = await UserModel.update(id, { 
            name: name || user.name,
            email: email || user.email,
            role: role || user.role,
        });
        
        if (!updatedUser) {
            throw new NotFoundError("No se pudo actualizar el usuario.");
        }

        return await UserModel.findByIdWithoutPassword(id);
    }

    // 5. Cambiar / Actualizar contraseña
    static async changePassword(id, { currentPassword, newPassword }) {
        // 5.1 Buscar el usuario trayendo el hash de la contraseña actual
        const user = await UserModel.findById(id);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado.");
        }

        // 5.2 Si se pasa currentPassword, validar que coincida
        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                throw new UnauthorizedError("La contraseña actual es incorrecta.");
            }
        }

        // 5.3 Hashear la nueva contraseña
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // 5.4 Actualizar en base de datos
        await UserModel.updatePassword(id, newPasswordHash);

        return { message: "Contraseña actualizada exitosamente." };
    }

    // 6. Activar/Desactivar usuario 
    static async toggleUserStatus(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado.");
        }

        await UserModel.toggleActive(id, !user.active);
        return { message: `Usuario ${user.active ? "desactivado" : "activado"} correctamente.` };
    }
}