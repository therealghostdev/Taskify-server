import { Request } from "express";
import { Algorithm } from "jsonwebtoken";
import { Types, Document, ObjectId } from "mongoose";

export interface userType extends Document {
  _id: Types.ObjectId;
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
  appleProfile?: [
    {
      id: string;
      email: string;
      displayName: string;
    }
  ];
  salt: string;
  hash: string;
  refreshToken: { value: string; version: number };
  createdAt?: Date;
}

export interface userSession {
  _id?: Types.ObjectId;
  firstname: string;
  lastname: string;
  username: string;
  auth_data: {
    token: string;
    expires: string;
    refreshToken: { value: string; version: number };
    csrf: string;
  };
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

export interface CookieOptions {
  path: string;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  httpOnly: boolean;
  expires: Date;
}

export type RecurrenceType = "daily" | "weekly" | "monthly";
export interface TaskType {
  name: string;
  description: string;
  priority: number;
  category: string;
  expected_completion_time: string;
  createdAt: Date;
  completed: boolean;
  isRoutine: boolean;
  recurrence: RecurrenceType;
  duration?: number;
}
export interface TaskDocument extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  priority: number;
  category: string;
  expected_completion_time: Date;
  createdAt: Date;
  completed: boolean;
  duration: number;
  completedAt: Date;
  user: ObjectId;
  isRoutine: boolean;
  triggerTime: string;
  recurrence: RecurrenceType;
  nextTrigger: Date;
  addTaskToUser(): Promise<void>;
}
