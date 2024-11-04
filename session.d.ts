/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import session from "express-session";

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}
