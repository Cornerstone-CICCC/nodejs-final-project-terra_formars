import { create } from "zustand";
import { AxiosError } from "axios";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../socket/socket.client";
import toast from "react-hot-toast";
import { Room } from "../types/room.type";

type RoomSettings = {
  maxPlayers: number;
  numberOfPrompts: number;
  timeLimit: number;
};

interface RoomMember {
  userId: string;
  username: string;
  isReady: boolean;
  joinedAt: Date;
}

interface RoomJoinedData {
  roomId: string;
  members: RoomMember[];
  settings: RoomSettings;
  theme: string;
  nextDrawer: string;
}

interface RoomMessageData {
  username: string;
  content: string;
}

interface RoomStore {
  codeword: string;
  maxPlayers: number;
  numberOfPrompts: number;
  timeLimit: number;
  status: string;
  settings: RoomSettings;
  hostId: number;
  pending: boolean;
  drawer: boolean;
  roomId: string;
  roomJoinData: RoomJoinedData;
  isReady: boolean;
  isOpenGameStart: boolean;
  currentRound: number;
  nextDrawer: string;
  roomMessageData: RoomMessageData[];

  createRoom: (roomSetting: Room) => Promise<void>;
  joinRoom: (codeWord: string) => Promise<void>;
  accessRoom: () => void;
  clearRoomId: () => void;
  setRoomJoinData: (data: RoomJoinedData) => void;
  updateRoomMember: (data: RoomMember) => void;
  setIsReady: () => void;
  updatePending: () => void;
  OpenGameStartModal: () => void;
  CloseGameStartModal: () => void;
  setGameSettings: (data: RoomJoinedData, username: string) => void;
  setRoomMessageData: (data: RoomMessageData) => void;
}

const setRoomSettings = (prefix: any) => {
  return {
    codeword: prefix.codeword,
    hostId: prefix.hostId,
    status: prefix.status,
    settings: {
      maxPlayers: prefix.settings.maxPlayers,
      numberOfPrompts: prefix.settings.numberOfPrompts,
      timeLimit: prefix.settings.timeLimit,
    },
    roomId: prefix._id,
  };
};

export const useRoomStore = create<RoomStore>((set) => ({
  codeword: "",
  maxPlayers: 2,
  numberOfPrompts: 2,
  timeLimit: 30,
  status: "",
  settings: { maxPlayers: 2, numberOfPrompts: 2, timeLimit: 30 },

  hostId: 0,
  pending: true,
  drawer: true,
  roomId: "",
  roomJoinData: {
    roomId: "",
    members: [],
    settings: { maxPlayers: 2, numberOfPrompts: 2, timeLimit: 30 },
    theme: "",
    nextDrawer: "",
  },
  isReady: false,
  isOpenGameStart: false,
  currentRound: 0,
  nextDrawer: "",
  roomMessageData: [{ username: "Risa", content: "test message" }],

  createRoom: async (roomSetting: Room) => {
    try {
      // create a new room
      const res = await axiosInstance.post("/room", {
        codeword: roomSetting.codeword,
        maxPlayers: roomSetting.maxPlayers,
        numberOfPrompts: roomSetting.numberOfPrompts,
        timeLimit: roomSetting.timeLimit,
      });

      set(setRoomSettings(res.data.room));
      toast.success("The game is starting soon!");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  },

  joinRoom: async (codeword: string) => {
    try {
      const res = await axiosInstance.post("/room/join", {
        codeword,
      });

      set(setRoomSettings(res.data.room));
      toast.success("The game is starting soon!");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  },

  clearRoomId: async () => {
    set({ roomId: "" });
  },

  // join
  accessRoom: () => {
    const socket = getSocket();
    socket.emit("join-room");
  },

  setRoomJoinData: (roomJoinData: RoomJoinedData) => {
    set((state) => {
      const newMembers = roomJoinData.members.filter((newMember) => {
        return !state.roomJoinData.members.some(
          (existingMember) => existingMember.userId === newMember.userId
        );
      });

      return {
        roomJoinData: {
          ...state.roomJoinData,
          members: [...state.roomJoinData.members, ...newMembers],
        },
      };
    });
  },

  updateRoomMember: (newMember: RoomMember) => {
    set((state) => {
      const existingMemberIndex = state.roomJoinData.members.findIndex(
        (member) => member.userId === newMember.userId
      );

      // player already exist
      if (existingMemberIndex !== -1) {
        const updatedMembers = state.roomJoinData.members.map((member) =>
          member.userId === newMember.userId ? newMember : member
        );

        return {
          roomJoinData: {
            ...state.roomJoinData,
            members: updatedMembers,
          },
        };
      } else {
        return {
          roomJoinData: {
            ...state.roomJoinData,
            members: [...state.roomJoinData.members, newMember],
          },
        };
      }
    });
  },

  setIsReady: () => {
    set((state) => ({
      isReady: !state.isReady,
    }));
  },

  updatePending: () => {
    set({ pending: false });
  },

  OpenGameStartModal: () => {
    set({ isOpenGameStart: true });
  },

  CloseGameStartModal: () => {
    set({ isOpenGameStart: false });
  },

  setGameSettings: (data: RoomJoinedData, authUser: string) => {
    set((state) => ({
      roomJoinData: {
        ...state.roomJoinData,
        theme: data.theme,
        nextDrawer: data.nextDrawer,
      },
    }));

    if (authUser === data.nextDrawer) {
      set({ drawer: true });
    } else {
      set({ drawer: false });
    }
  },

  setRoomMessageData: (data: RoomMessageData) => {
    set((state) => ({
      roomMessageData: [...state.roomMessageData, data],
    }));
  },
}));
