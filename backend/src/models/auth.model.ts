import { Request } from "express";
import { IUser } from "./user.model";

export interface JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}
