import { google } from "googleapis";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_REDIRECT_URI,
} from "../config/dotenv.js";

// initialize oAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
);

oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

export const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

export const encodeMessage = (message: string) => {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};
