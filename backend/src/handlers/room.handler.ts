import { Server, Socket } from "socket.io";
import { Room } from "../models/room.model";
import { getRandomTheme } from "../utils/rondom.theme";

export const createRoomHandler = (io: Server, socket: Socket) => {
  // Join room
  const handleJoinRoom = async (roomId: string) => {
    try {
      // check and update room
      const room = await Room.findOneAndUpdate(
        {
          _id: roomId,
          "members.userId": { $ne: socket.user?._id }, // user is not joined
          $expr: {
            $lt: [{ $size: "$members" }, "$settings.maxPlayers"], // room is not full
          },
        },
        {
          $addToSet: {
            members: {
              userId: socket.user?._id,
              username: socket.user?.username,
              isReady: false,
              joinedAt: new Date(),
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!room) {
        // check if already joined or room not found
        const existingRoom = await Room.findById(roomId);
        if (!existingRoom) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const isMember = existingRoom.members.some((m) =>
          m.userId.equals(socket.user?._id)
        );
        if (isMember) {
          socket.emit("error", { message: "You are already in this room" });
          return;
        }

        socket.emit("error", { message: "Room is full" });
        return;
      }

      // success
      socket.join(roomId);
      // send room info to client
      socket.emit("room:joined", {
        roomId,
        members: room.members,
        settings: room.settings,
      });
      console.log("room:joined", room.members);
      // notify other members
      socket.to(roomId).emit("room:member_joined", {
        userId: socket.user?._id,
        username: socket.user?.username,
        joinedAt: new Date(),
      });
    } catch (error) {
      console.error("Error in handleJoinRoom:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  };
  // Leave room
  const handleLeaveRoom = async (roomId: string) => {
    try {
      console.log("handleLeaveRoom", roomId);
      const room = await Room.findByIdAndUpdate(roomId, {
        $pull: { members: { userId: socket.user?._id } },
        new: true,
      });
      if (!room) {
        console.error("Room not found in handleLeaveRoom", roomId);
        socket.emit("error", { message: "Room not found" });
        return;
      }
      console.log("check user on socket", socket.user?.username);
      // Remove member from room
      room.members = room.members.filter(
        (m) => !m.userId.equals(socket.user?._id)
      );
      if (room.members.length === 0) {
        console.log("delete room", roomId);
        await Room.findByIdAndDelete(roomId);
        io.to(roomId).emit("room:deleted", { roomId });
        socket.leave(roomId);
        return;
      }
      // If host leaves, assign new host
      if (room.hostId.equals(socket.user?._id)) {
        room.hostId = room.members[0].userId;
        await room.save();
      }

      console.log("room:member_left", socket.user?.username);
      // Notify other members
      io.to(roomId).emit("room:member_left", {
        userId: socket.user?._id,
        username: socket.user?.username,
        leftAt: new Date(),
      });
      socket.leave(roomId);
    } catch (error) {
      console.error("Error in handleLeaveRoom", error);
      socket.emit("error", { message: "Failed to leave room" });
    }
  };

  // Ready status change
  const handleReady = async (roomId: string) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Update member ready status
      const member = room.members.find((m) =>
        m.userId.equals(socket.user?._id)
      );
      if (member) {
        member.isReady = !member.isReady;
        await room.save();

        console.log("room:member_ready");
        // Broadcast ready status change
        io.to(roomId).emit("room:member_ready", {
          userId: socket.user?._id,
          username: socket.user?.username,
          isReady: member.isReady,
        });

        // Check if all members are ready
        const allReady = room.members.every((m) => m.isReady);
        if (allReady) {
          // update room and send game start event to all members
          room.status = "active";

          room.currentDrawer = {
            userId: socket.user?._id,
            startedAt: new Date(),
          };
          room.previousDrawers.push(socket.user?._id);
          room.theme = getRandomTheme();
          room.currentRound = 1;

          io.to(roomId).emit("room:game_start", {
            nextDrawer: member.username,
            currentRound: room.currentRound,
            totalRounds: room.settings.numberOfPrompts,
            theme: room.theme,
            startTime: new Date(),
          });
          await room.save();
        }
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to update ready status" });
    }
  };

  // Draw
  interface Point {
    x: number;
    y: number;
  }
  const handleDraw = async (data: {
    points: Point[];
    type: "start" | "move" | "end";
    color: string;
    roomId: string;
  }) => {
    try {
      if (!data.roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }
      // check if room is active
      const room = await Room.findById(data.roomId);
      // active or pending
      if (room?.status !== "active" && room?.status !== "pending") {
        socket.emit("error", { message: "Room is not active" });
        return;
      }
      // check if user is in the room
      const member = room.members.find((m) =>
        m.userId.equals(socket.user?._id)
      );
      if (!member) {
        socket.emit("error", { message: "You are not in this room" });
        return;
      }
      // check if joined in socket
      if (!socket.rooms.has(data.roomId)) {
        console.log("somehow not joined in socket", data.roomId);
        socket.join(data.roomId);
      }

      // Broadcast draw event to all members in the room except the sender
      socket.to(data.roomId).emit("room:draw_sync", data);

      // Debug
      //console.log("room:draw_sync", data);
      //console.log("socket.rooms", socket.rooms);
    } catch (error) {
      console.error("Error in handleDraw", error);
      socket.emit("error", { message: "Failed to draw" });
    }
  };

  const handleClearDraw = async (roomId: string) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      if (room.status !== "active" && room.status !== "pending") {
        socket.emit("error", { message: "Room is not active" });
        return;
      }
      // check if user is in the room
      const member = room.members.find((m) =>
        m.userId.equals(socket.user?._id)
      );
      if (!member) {
        socket.emit("error", { message: "You are not in this room" });
        return;
      }
      // check if joined in socket
      if (!socket.rooms.has(roomId)) {
        console.log("somehow not joined in socket", roomId);
        socket.join(roomId);
      }
      // broadcast clear draw event to all members in the room except the sender
      socket.to(roomId).emit("room:clear_canvas");
    } catch (error) {
      console.error("Error in handleClearDraw", error);
      socket.emit("error", { message: "Failed to clear draw" });
    }
  };

  const handleAnswer = async ({
    roomId,
    content,
  }: {
    roomId: string;
    content: string;
  }) => {
    const room = await Room.findById(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // check if the game is active
    if (room.status !== "active") {
      socket.emit("error", { message: "Game is not active" });
      return;
    }

    // current drawer can't answer
    if (room.currentDrawer?.userId === socket.user?._id) {
      socket.emit("error", { message: "Drawer can't answer" });
      return;
    }

    // check if the answer is correct
    const isCorrect = room.theme?.toLowerCase() === content.toLowerCase();

    // if inCorrect, send message to room and return
    if (!isCorrect) {
      // Broadcast message to room
      io.to(roomId).emit("room:message", {
        username: socket.user?.username,
        content: content,
      });
      return;
    }

    // if correct, processing score, and send message to room
    const member = room.members.find((member) =>
      member.userId.equals(socket.user?._id)
    );
    if (member) {
      member.score++;
    }
    // set next drawer who is not the current / previous drawer
    const previousDrawers = room.previousDrawers;
    if (previousDrawers.length === room.members.length) {
      room.previousDrawers = [];
    }
    const nextDrawer = room.members.find(
      (member) =>
        member.userId !== socket.user?._id &&
        !previousDrawers.includes(member.userId)
    );
    if (nextDrawer) {
      const timeLimit = room.settings.timeLimit * 1000;
      setTimeout(() => {
        handleTimeUp(roomId);
      }, timeLimit);

      room.currentDrawer = {
        userId: nextDrawer.userId,
        startedAt: new Date(),
      };
      room.previousDrawers.push(nextDrawer.userId);
    }
    // set new theme
    room.theme = getRandomTheme();
    // check if round is over
    if (room.currentRound === room.settings.numberOfPrompts) {
      room.status = "finished";
    }
    // increment round
    room.currentRound++;
    // update room
    await room.save();

    // Broadcast message to room
    io.to(roomId).emit("room:message", {
      username: socket.user?.username,
      content: content,
    });

    // if round is over, notify all members
    if (room.status === "finished") {
      // show result (members score)
      const memberResults = room.members.map((member) => ({
        userId: member.userId,
        username: member.username,
        score: member.score,
      }));
      io.to(roomId).emit("room:finished", {
        results: memberResults,
      });
    } else {
      io.to(roomId).emit("room:correct", {
        content: `${socket.user?.username} is correct!`,
        answer: content,
        answerBy: socket.user?.username,
        nextTheme: room.theme,
        nextDrawer: nextDrawer?.username,
        currentRound: room.currentRound,
        totalRounds: room.settings.numberOfPrompts,
      });
    }
  };

  const handleTimeUp = async (roomId: string) => {
    const room = await Room.findById(roomId);
    if (!room) {
      return;
    }
    io.to(roomId).emit("room:time_up", {
      content: "Time is up",
      answer: room.theme,
    });
  };

  const handleRematch = async (roomId: string) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        return;
      }
      // if room not pending(other user already selected rematch), join the room
      if (room.status === "pending") {
        io.to(roomId).emit("room:rematch", {
          roomId,
          members: [
            ...room.members,
            {
              userId: socket.user?._id,
              username: socket.user?.username,
              isReady: false,
              joinedAt: new Date(),
              score: 0,
            },
          ],
        });
        return;
      }
      // reset room
      room.status = "pending";
      room.currentRound = 0;
      room.previousDrawers = [];
      room.currentDrawer = undefined;
      room.members = [
        {
          userId: socket.user?._id,
          username: socket.user?.username,
          isReady: false,
          joinedAt: new Date(),
          score: 0,
        },
      ];
      room.drawings = [];
      await room.save();
      io.to(roomId).emit("room:rematch", {
        roomId,
        members: room.members,
      });
    } catch (error) {
      console.error("Error in handleRematch", error);
      socket.emit("error", { message: "Failed to rematch" });
    }
  };

  // Register event handlers
  socket.on("room:join", handleJoinRoom);
  socket.on("room:ready", handleReady);
  socket.on("room:leave", handleLeaveRoom);
  socket.on("room:draw", handleDraw);
  socket.on("room:answer", handleAnswer);
  socket.on("room:clear", handleClearDraw);
  socket.on("room:rematch", handleRematch);

  return {
    handleJoinRoom,
    handleLeaveRoom,
    handleReady,
    handleDraw,
    handleAnswer,
    handleClearDraw,
    handleRematch,
  };
};
