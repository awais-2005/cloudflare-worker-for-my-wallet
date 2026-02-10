import { ApiError } from "../utils/ApiError";

export async function resetEverything(c) {
    const db = c.env.DB;
    try {
        await db.batch([
            db.prepare("DELETE FROM transactions"),
            db.prepare("DELETE FROM sqlite_sequence WHERE name='transactions'"),
            db.prepare("DELETE FROM users"),
            db.prepare("DELETE FROM sqlite_sequence WHERE name='users'")
        ]);
    } catch (err) {
        throw new ApiError(500, err);
    }
    return c.json({ message: "Your backend has been cleaned up." });
}