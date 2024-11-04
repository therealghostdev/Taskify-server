/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { Algorithm } from "jsonwebtoken";
import { Types, Document, ObjectId, Schema } from "mongoose";

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
  _id: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  name: string;
  description: string;
  priority: number;
  category: string;
  expected_completion_time: string;
  createdAt: Date;
  completed: boolean;
  onFocus: boolean;
  completedAt: Date;
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
  isCounted: boolean;
  onFocus: boolean;
  isRoutine: boolean;
  triggerTime: string;
  recurrence: RecurrenceType;
  nextTrigger: Date;
  addTaskToUser(): Promise<void>;
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  google_profile: Array<any>;
  appleProfile: Array<any>;
  hash: string;
  salt: string;
  refreshToken: { value: string; version: number };
  createdAt: Date;
  tasks: Array<Schema.Types.ObjectId>;
  taskCount: {
    completed: number;
    incomplete: number;
    total: number;
  };
  fcmToken: string;
  timezone: string;
  updateTaskCounts: () => Promise<void>;
}
