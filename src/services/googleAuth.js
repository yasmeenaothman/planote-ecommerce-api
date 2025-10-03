import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  const login_ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = login_ticket.getPayload();

  return {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    email_verified: payload.email_verified,
  };
};
