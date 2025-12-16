import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { StringValue as MsStringValue } from "ms";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
const RAW_EXPIRES = process.env.JWT_EXPIRES || "1h";

// Accept numbers (seconds) or strings like "1h"
type Expires = number | MsStringValue;
const expiresIn: Expires = /^\d+$/.test(RAW_EXPIRES)
  ? Number(RAW_EXPIRES)
  : (RAW_EXPIRES as MsStringValue);

export type JwtPayload = {
  sub: string;
  email: string;
  role: "employer" | "jobseeker";
};

export function signAccessToken(payload: JwtPayload) {
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload as any, JWT_SECRET, opts);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload & {
    iat: number;
    exp: number;
  };
}
