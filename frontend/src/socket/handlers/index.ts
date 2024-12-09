import { Socket } from "socket.io-client";
import { createRoomHandler } from "./room.handler.client";

export const registerSocketHandlers = (socket: Socket) => {
  const cleanupFunctions = [createRoomHandler(socket)].filter(
    (fn) => fn !== null
  );

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup && cleanup());
  };
};
