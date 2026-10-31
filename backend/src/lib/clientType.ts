import { Request } from "express";

export type ClientType = "MOBILE" | "WEB";

/**
 * This API is built mobile-first (the Flutter app is the primary client; the web
 * dashboard is the secondary, hospital/admin-only surface) — so unless a request
 * explicitly identifies itself as the browser via `X-Client-Type: web`, we treat it
 * as mobile: issue the refresh token directly in the JSON body instead of an
 * HttpOnly cookie, since a mobile client has no cookie jar for that to work with.
 */
export const getClientType = (req: Request): ClientType =>
  req.headers["x-client-type"] === "web" ? "WEB" : "MOBILE";
