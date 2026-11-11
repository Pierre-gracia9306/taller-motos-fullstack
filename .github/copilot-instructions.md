# Copilot instructions for `taller-motos-fullstack`

## Project shape
- This repo is a small full-stack app, but the implemented code is centered on the backend at `taller-backend/`.
- The backend is an Express app with ES modules (`"type": "module"`) and runs from `src/server.js`.
- API bootstrap is in `src/app.js`: it registers all route groups under `/api/v1`, adds a global `responseHandler`, and ends with the central `errorHandler` middleware.
- The app follows a layered pattern: `routes -> controllers -> services -> models`; do not add business logic directly in controllers.
- Example: `src/routes/work_order.routes.js` defines HTTP endpoints, `src/controllers/work_order.controller.js` validates/body checks, and `src/services/work_order.service.js` enforces the work-order state machine.

## Critical business rules
- `WorkOrderService.updateOrderStatus()` is the main business logic hotspot: it enforces allowed transitions (`RECIBIDA -> DIAGNOSTICO -> EN_REPARACION -> LISTA -> ENTREGADA`), forbids changing closed orders, and requires admin privileges for `ENTREGADA` / `CANCELADA`.
- `WorkOrderItemModel` and `WorkOrderModel` are thin SQL wrappers using the shared `mysql2/promise` pool in `src/config/db.js`.
- Error handling is custom and centralized via `src/utils/errors.js` and `src/middlewares/error.middleware.js`; prefer throwing `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, etc.

## Auth and security conventions
- Auth is JWT-based: `AuthService.loginUser()` issues access + refresh tokens; `authenticateToken` in `src/middlewares/auth.middleware.js` reads `Authorization: Bearer <token>` and injects `req.user`.
- Refresh tokens are stored in an HTTP-only cookie (`refreshToken`) in `src/controllers/auth.controller.js`; do not move session state into the database unless the architecture explicitly changes.
- Role checks use `authorizeRoles(...allowedRoles)` and the controller/service layer checks `req.user.role`.

## Configuration and setup
- Required env vars are validated in `src/config/env.js`: `PORT`, `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`.
- Local dev commands from `taller-backend`: `npm install`, `npm run dev`, or `npm start`.
- `seed.js` creates/updates the initial admin with default credentials (`admin@taller.com` / `Admin123*` unless overridden via env vars).
- The frontend folder is currently empty, so backend work is the active implementation path.

## Coding patterns to preserve
- Keep the static class pattern (`Export class XRoutes`, `XController`, `XService`, `XModel`) already used across the backend.
- Response format is standardized via `res.success()` / `res.created()` in `src/middlewares/response.middleware.js`.
- Avoid making ad hoc SQL in controllers or services; prefer extending the model classes, as seen in `src/models/*.js`.
- Keep MySQL pool usage centralized and do not add separate DB clients.
- When adding a new endpoint, update the route registry in `src/app.js` and mirror the route/controller/service/model structure used elsewhere.
