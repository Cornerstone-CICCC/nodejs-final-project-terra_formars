import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../server"; // Expressアプリケーションのインスタンス
import { Room } from "../models/room.model";

describe("Room API", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Room.deleteMany({});
  });

  it("should create a new room", async () => {
    const response = await request(app).put("/api/room").send({
      codeword: "testroom",
      maxPlayers: 4,
      numberOfPrompts: 3,
      timeLimit: 60,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("room");
    expect(response.body.room).toHaveProperty("theme", "test theme"); // themeを確認
    expect(response.body.room.settings).toEqual({
      maxPlayers: 4,
      numberOfPrompts: 3,
      timeLimit: 60,
    }); // settingsを確認
  });

  it("should join a room", async () => {
    // First, create a room
    const room = await Room.create({
      codeword: "testroom",
      status: "pending",
      hostId: new mongoose.Types.ObjectId(),
      settings: {
        maxPlayers: 4,
        numberOfPrompts: 3,
        timeLimit: 60,
      },
      members: [],
      theme: "test theme",
    });

    const response = await request(app)
      .post("/api/room/join")
      .send({ codeword: "testroom" });
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("room");
  });
});
