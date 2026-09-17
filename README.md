# 🏍️ Sistema de Control de Taller de Motocicletas (MVP Full-Stack)

Plataforma web integral para la gestión operativa, control de órdenes de trabajo, repuestos, auditoría de estados y trazabilidad en talleres mecánicos.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, JWT, Bcrypt.
- **Base de Datos:** MySQL (Relacional, Constraints de Integridad, DDL optimizado).
- **Frontend:** React.js, Context API, Axios Interceptors, React Router.

## 🔑 Características Clave
- **Autenticación y Autorización RBAC:** Control de acceso estricto según roles (ADMIN y MECÁNICO).
- **Matriz de Transición de Estados:** Flujo inmutable y secuencial para órdenes de trabajo (RECIBIDA ➔ DIAGNÓSTICO ➔ EN_PROCESO ➔ LISTA ➔ ENTREGADA).
- **Auditoría e Inmutabilidad:** Trazabilidad automática de cambios de estado e historial de acciones por usuario.
- **Manejo Silencioso de Token (JWT Refresh):** Interceptores Axios en Frontend para mantenimiento de sesión activa.