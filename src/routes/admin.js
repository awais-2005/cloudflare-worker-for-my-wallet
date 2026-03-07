import { resetEverything } from "../controllers/admin.controller.js";
import { adminSignup, adminLogin, adminCanSignup } from "../controllers/admin.auth.controller.js";
import { getStats, getUsers, getUserDetails, getTransactions } from "../controllers/admin.dashboard.controller.js";
import { adminGuard } from "../middleware/adminGuard.js";
import { serveDashboard } from "../views/dashboard.js";

export function handleAdminRoutes(app) {
    // Admin auth (no guard needed)
    app.get("/admin/can-signup", adminCanSignup);
    app.post("/admin/signup", adminSignup);
    app.post("/admin/login", adminLogin);

    // Admin dashboard page (serves HTML)
    app.get("/admin/dashboard", serveDashboard);
    app.get("/admin/dashboard/*", serveDashboard);

    // Admin API (requires admin JWT)
    app.get("/admin/api/stats", adminGuard, getStats);
    app.get("/admin/api/users", adminGuard, getUsers);
    app.get("/admin/api/users/:id", adminGuard, getUserDetails);
    app.get("/admin/api/transactions", adminGuard, getTransactions);

    // Destructive (keep existing)
    app.delete("/admin/reset", resetEverything);
}