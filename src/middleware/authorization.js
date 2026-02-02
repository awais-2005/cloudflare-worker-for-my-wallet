import { ApiError } from "../utils/ApiError"

export async function authorize(c, next) {
    const API_KEY = c.req.header('x-api-key');
    if(!API_KEY) throw new ApiError(404, "x-api-key header is not found");
    if(API_KEY !== c.env.API_KEY) throw new ApiError(401, "Invalid API_KEY.");

    await next();
}