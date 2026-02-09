import { ApiError } from "./ApiError";

export function getId(user) {
    try {
        const user_id = user.id;
        if (!user_id) throw new Error("Id is undefined.");
        return user_id;
      } catch (err) {
        throw new ApiError(500, err);    
      }
}