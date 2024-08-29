import { Request } from "express";
import { Algorithm } from "jsonwebtoken";
import { Types, Document } from "mongoose";

export interface userType extends Document {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  userName: string;
  googleProfile?: [
    {
      id: string;
      email: string;
      avatar: string;
      displayName: string;
    }
  ];
  salt: string;
  hash: string;
  createdAt?: Date;
}

export interface userSession {
  _id?: Types.ObjectId;
  firstname: string;
  lastname: string;
  username: string;
  cssrfToken: { token: string; expires: string };
}

export interface passportOptionTypes {
  jwtFromRequest: (req: Request) => string | null;
  secretOrKey: string | Buffer;
  algorithms: Algorithm[];
}

export interface JwtPayloadType {
  sub: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export type DoneFunctionType = (
  error: Buffer | null,
  user?: unknown,
  info?: unknown
) => void;
