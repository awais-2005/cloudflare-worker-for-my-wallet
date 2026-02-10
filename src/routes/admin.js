import { resetEverything } from "../controllers/admin.controller";

export function handleAdminRoutes(app) {
    app.delete("/admin/reset", resetEverything)
}