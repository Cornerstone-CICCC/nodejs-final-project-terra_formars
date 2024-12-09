import { IUser } from "../models/user.model";

declare module "socket.io" {
  interface Socket {
    user: IUser;
  }
}
