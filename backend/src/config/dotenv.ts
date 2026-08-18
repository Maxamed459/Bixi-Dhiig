import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
export const GOOGLE_OAUTH_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const SENDER_EMAIL = process.env.SENDER_EMAIL;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const LOG_LEVEL = process.env.LOG_LEVEL;
export const NODE_ENV = process.env.NODE_ENV;
export const MAX_LIMIT = Number(process.env.MAX_LIMIT || "100");
export const DEFAULT_LIMIT = Number(process.env.DEFAULT_LIMIT || "10");
export const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE || 1);
