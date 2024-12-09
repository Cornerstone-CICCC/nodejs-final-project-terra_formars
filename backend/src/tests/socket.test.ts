import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import { createServer } from "http";
import mongoose from "mongoose";
import { AddressInfo } from "net";
import { initializeSocket } from "../socket";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Room } from "../models/room.model";
describe("Socket.io", () => {
  let io: Server;
  let clientSocket: any;
  let mongoServer: MongoMemoryServer;
  let httpServer: any;
  let testRoom: any;

  beforeAll(async () => {
    // Setup MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log("connected to mongo");

    // Setup HTTP server
    httpServer = createServer();
    io = initializeSocket(httpServer);
    console.log("initialized socket");
    await new Promise((resolve, reject) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        console.log(`listening on port ${port}`);
        clientSocket = Client(`http://localhost:${port}`, {
          auth: { token: "valid_jwt_token" },
        });
        clientSocket.on("connect", resolve);
        clientSocket.on("connect_error", reject);
      });
    });
    // Create room
    testRoom = new Room({
      theme: "test_theme",
      codeword: "mock_room",
      hostId: new mongoose.Types.ObjectId(),
      settings: {
        maxPlayers: 4,
        numberOfPrompts: 10,
        timeLimit: 60,
      },
    });
    await testRoom.save();
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    await new Promise((resolve) => {
      httpServer.close(() => {
        io.close();
        resolve(true);
      });
    });
    await Room.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should join a room", (done) => {
    // Event listener
    clientSocket.on("room:member_joined", (data: any) => {
      console.log("room:member_joined", data);
      expect(data).toHaveProperty("userId");
      done();
    });

    // Error handler
    clientSocket.on("error", (error: any) => {
      console.error(error);
      done(error);
    });

    // Emit event
    console.log("joining room", testRoom._id);
    clientSocket.emit("room:join", testRoom._id);
  }, 10000);

  it("should leave and delete room", (done) => {
    let joined = false;

    // Setup event listeners
    const setupHandler = () => {
      clientSocket.on("room:member_joined", async (data: any) => {
        try {
          console.log("Join completed, verifying room exists...");
          const room = await Room.findById(testRoom._id);
          console.log("Room after join", room);
          if (!room) {
            throw new Error("Room not found");
          }
          if (!joined && room) {
            joined = true;
            console.log("Room exists, leaving...");

            setTimeout(() => {
              clientSocket.emit("room:leave", testRoom._id);
            }, 500);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      });

      clientSocket.on("room:deleted", (data: any) => {
        console.log("room:deleted", data);
        expect(data).toHaveProperty("roomId");
        done();
      });

      // Error handler
      clientSocket.on("error", (error: any) => {
        console.error(error);
        done(error);
      });
    };
    try {
      setupHandler();
      clientSocket.emit("room:join", testRoom._id);
    } catch (error) {
      console.error(error);
      done(error);
    }
  }, 10000);

  it("should delete a room", (done) => {
    done();
  });

  // it("should handle game start when all members are ready", (done) => {
  //   // Event listener
  //   clientSocket.on("room:game_start", (data: any) => {
  //     console.log("room:game_start", data);
  //     done();
  //   });

  //   // Error handler
  //   clientSocket.on("error", (error: any) => {
  //     console.error(error);
  //     done(error);
  //   });

  //   // Emit event
  //   console.log("starting game");
  //   clientSocket.emit("room:ready", testRoom._id);
  // }, 10000);
});
