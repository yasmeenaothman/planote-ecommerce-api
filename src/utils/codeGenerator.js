import crypto from "crypto"

export const generateResetCode = (minutes = 30) => {
  const code = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + minutes * 60 * 1000);
  return { code, expires };
};