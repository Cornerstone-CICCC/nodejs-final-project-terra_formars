import { Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { Result } from "../../types/result.type";
import { useRoomStore } from "../../store/useRoomStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useResultStore } from "../../store/useResultStore";
import { NavigateFunction } from "react-router-dom";
interface RoomMember {
  userId: string;
  username: string;
  isReady: boolean;
  joinedAt: Date;
}

interface RoomSettings {
  maxPlayers: number;
  numberOfPrompts: number;
  timeLimit: number;
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

interface RoomCorrectAnswerData {
  content: string;
  answer: string;
  answerBy: string;
  nextTheme: string;
  nextDrawer: string;
  currentRound: number;
  totalRounds: number;
}

interface RoomFinishedData {
  results: Result[];
}

export const createRoomHandler = (
  socket: Socket,
  navigate: NavigateFunction
) => {
  // Remove all event handlers
  socket.off("room:member_joined");
  socket.off("room:member_left");
  socket.off("room:member_ready");
  socket.off("room:joined");
  socket.off("room:game_start");
  socket.off("room:message");
  socket.off("room:correct");
  socket.off("room:finished");
  socket.off("room:rematch");
  socket.off("error");

  const {
    roomId,
    setRoomJoinData,
    updateRoomMember,
    OpenGameStartModal,
    OpenGameOverModal,
    setGameSettings,
    setRoomMessageData,
    setRoomCorrectAnswerData,
    setRematch,
    setMobileMessage,
    setAllGameOver,
  } = useRoomStore.getState();

  const { setResult } = useResultStore.getState();
  const { authUser } = useAuthStore.getState();

  const handleRoomJoined = (data: RoomJoinedData) => {
    // JoinしたユーザーにRoomの設定とメンバーを通知
    console.log("Room joined:", data);
    setRoomJoinData(data);
  };

  const handleMemberJoined = (data: RoomMember) => {
    // 他のユーザーがJoinした時に通知
    console.log("Member joined:", data);
    toast.success(`${data.username} joined the room`);
    updateRoomMember(data);
  };

  const handleRoomReady = (data: RoomMember) => {
    // ユーザーがReadyした時に通知
    console.log("Room ready:", data);
    // toast.success(`${data.username} is ready`); todo: figure out why multiple toasts are displayed.
    updateRoomMember(data);
  };

  const handleGameStart = (data: RoomJoinedData) => {
    // ゲームが開始(全員Readyした時)に通知
    console.log("Game start:", data);
    setGameSettings(data, authUser?.username as string);
    socket.emit("room:clear", roomId);
    OpenGameStartModal();
  };

  const handleTimeUp = (data: RoomJoinedData) => {
    // お題のTimeupで通知
    console.log("Time up:", data);
    // Todo show message in room
    // Todo update room store
  };

  const handleCorrectAnswer = (data: RoomCorrectAnswerData) => {
    console.log("Answer correct:", data);
    setRoomCorrectAnswerData(data, authUser?.username as string);
    OpenGameOverModal();
    // clear canvas
    socket.emit("room:clear", roomId);
  };

  const handleMessage = (data: RoomMessageData) => {
    console.log("Message:", data);
    setRoomMessageData(data);
    setMobileMessage(data);
  };

  const handleFinished = (data: RoomFinishedData) => {
    console.log("Finished:", data.results);
    setResult(data.results);
    setAllGameOver();
    OpenGameOverModal();
  };

  const handleMemberLeft = (data: RoomJoinedData) => {
    console.log("Member left:", data);
    toast.success(`${data.members[0].username} left the room`);
    // Todo update room store
  };

  const handleRematch = (data: RoomJoinedData) => {
    setRematch(data.members);
  };

  const handleError = (error: Error) => {
    console.error("Socket error:", error);
  };

  // Register event handlers
  socket.on("room:member_joined", handleMemberJoined);
  socket.on("room:member_left", handleMemberLeft);
  socket.on("room:joined", handleRoomJoined);
  socket.on("room:member_ready", handleRoomReady);
  socket.on("room:game_start", handleGameStart);
  socket.on("room:time_up", handleTimeUp);
  socket.on("room:correct", handleCorrectAnswer);
  socket.on("room:message", handleMessage);
  socket.on("room:finished", handleFinished);
  socket.on("room:rematch", handleRematch);
  socket.on("error", handleError);

  // Return cleanup function
  return () => {
    socket.off("room:member_joined", handleMemberJoined);
    socket.off("room:member_left", handleMemberLeft);
    socket.off("room:member_ready", handleRoomReady);
    socket.off("room:joined", handleRoomJoined);
    socket.off("room:game_start", handleGameStart);
    socket.off("room:message", handleMessage);
    socket.off("room:correct", handleCorrectAnswer);
    socket.off("room:finished", handleFinished);
    socket.off("room:rematch", handleRematch);
    socket.off("error", handleError);
  };
};
