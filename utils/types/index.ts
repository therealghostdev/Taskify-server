import { Request } from "express";
import { Algorithm } from "jsonwebtoken";

export interface userType {
  _id?: string;
  firstName: string;
  lastName: string;
  userName: string;
  salt?: string;
  hash?: string;
}

export interface passportOptionTypes {
  jwtFromRequest: (req: Request) => string | null;
  secretOrKey: string | Buffer
  algorithms: Algorithm[];
}

export interface JwtPayloadType {
  sub: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export type DoneFunctionType = (error: Buffer | null, user?: unknown, info?: unknown) => void;

