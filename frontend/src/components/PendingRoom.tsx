import { FormEvent, useEffect, useRef, useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Button from "./Button";
import { useRoomStore } from "../store/useRoomStore";
import { getSocket } from "../socket/socket.client";
import { useNavigate } from "react-router-dom";
import { createRoomHandler } from "../socket/handlers/room.handler.client";
import GameStartModal from "./GameStartModal";
import GameOverModal from "./GameOverModal";
import toast from "react-hot-toast";

const Room = () => {
  const navigate = useNavigate();
  const handleGetReady = () => {
    socket.emit("room:ready", roomId);
    setIsReady();
  };

  const [isMobile, setIsMobile] = useState(false);

  const {
    settings,
    pending,
    drawer,
    roomId,
    codeword,
    roomJoinData,
    isReady,
    isOpenGameStart,
    isOpenGameOver,
    roomMessageData,
    mobile_username,
    mobile_message,
    setIsReady,
    CloseGameStartModal,
    CloseGameOverModal,
    clearMobileMessage,
  } = useRoomStore();

  const socket = getSocket();
  const hasJoinId = useRef(false);
  createRoomHandler(socket, navigate);

  // Join room if component is mounted
  useEffect(() => {
    if (!socket || !roomId) return;
    if (hasJoinId.current) return;
    socket.emit("room:join", roomId);
    hasJoinId.current = true;
    const handleBeforeUnload = () => {
      socket.emit("room:leave", roomId);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, roomId]);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (mobile_username && isMobile) {
      toast(`${mobile_username} : "${mobile_message}"`, {
        style: {
          background: "white",
          color: "#333",
          border: "2px solid green",
          borderRadius: "10px",
          fontWeight: "600",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        },
      });
      clearMobileMessage();
    }
  }, [mobile_username, mobile_message, isMobile, clearMobileMessage]);

  const [content, setContent] = useState<string>("");

  const handleCloseModal = () => {
    CloseGameStartModal();
  };

  const handleGameOverModal = () => {
    CloseGameOverModal();
  };

  const handleInputChange = (val: React.ChangeEvent<HTMLInputElement>) => {
    setContent(val.target.value);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      console.log("roomId", roomId, "content", content);
      socket.emit("room:answer", {
        roomId,
        content,
      });
      setContent("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row md:gap-8 mt-12">
      <div className="flex flex-col items-center w-full lg:w-2/3 md:gap-2">
        {pending ? (
          <p className="p-2 font-poppins text-center text-sm font-medium bg-custom-albescent-white w-full rounded-lg">
            Please wait for everyone to get ready.
          </p>
        ) : (
          <>
            {drawer ? (
              <div className="flex w-full gap-3">
                <div className="relative w-1/2">
                  <p className="absolute top-1/5 left-3 transform -translate-y-1/2 text-custom-cape-cod text-sm  bg-custom-serenade mx-1 px-2 font-bold">
                    Theme
                  </p>
                  <p className="flex justify-center items-center rounded-lg border-2 border-black h-11 font-russo_one shadow-custom_light">
                    {roomJoinData.theme}
                  </p>
                </div>
                <div className="relative w-1/2">
                  <p className="absolute top-1/5 left-3 transform -translate-y-1/2 text-custom-cape-cod text-sm bg-custom-serenade mx-1 px-2 font-bold">
                    Time Left
                  </p>
                  <div className="flex w-full justify-center items-center rounded-lg border-2 border-black h-11 font-russo_one shadow-custom_light gap-2">
                    <div className="w-[20px]">
                      <img src="../../public/stopwatch.png" alt="stopwatch" />
                    </div>
                    <p>00:00:30</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full gap-3">
                <div className="relative w-1/2">
                  <p className="absolute top-1/5 left-3 transform -translate-y-1/2 text-custom-cape-cod text-sm bg-custom-serenade mx-1 px-2 font-bold">
                    Drawer
                  </p>
                  <div className="flex w-full justify-center items-center rounded-lg border-2 border-black h-11 font-russo_one shadow-custom_light gap-2">
                    <div className="w-[24px]">
                      <img src="/bee.png" alt="stopwatch" />
                    </div>
                    <p className="">{roomJoinData.nextDrawer}</p>
                  </div>
                </div>
                <div className="relative w-1/2">
                  <p className="absolute top-1/5 left-3 transform -translate-y-1/2 text-custom-cape-cod text-sm bg-custom-serenade mx-1 px-2 font-bold">
                    Time Left
                  </p>
                  <div className="flex w-full justify-center items-center rounded-lg border-2 border-black h-11 font-russo_one shadow-custom_light gap-2">
                    <div className="w-[20px]">
                      <img src="../../public/stopwatch.png" alt="stopwatch" />
                    </div>
                    <p>00:00:30</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div className="w-full">
          <div className="w-full">
            {!(pending && isMobile) ? <DrawingCanvas /> : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full w-full lg:w-1/3 gap-10 md:gap-6">
        {pending ? (
          <>
            <div className="relative border-2 border-black rounded-xl bg-custom-yellow mt-16 h-[180px]">
              <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black rounded-xl w-2/3 bg-white text-center font-russo_one">
                Room Settings
              </div>
              <div className="flex flex-col justify-center h-full gap-2 text-lg rounded-xl font-nunito font-semibold px-14">
                <p>Codeword : {codeword}</p>
                <p>Time Limitation : {settings.timeLimit}sec</p>
                <p>Number of Prompts : {settings.numberOfPrompts}</p>
              </div>
            </div>
            <div className="relative border-2 border-black rounded-xl bg-custom-teal h-[180px]">
              <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black rounded-xl w-2/3 bg-white text-center font-russo_one">
                Player
              </div>
              <div className="flex flex-col h-full gap-2 text-lg rounded-xl font-nunito font-semibold py-2 px-12">
                <ul className="flex flex-col gap-3 my-7">
                  {roomJoinData.members.map((data, index) => (
                    <li key={index} className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="border border-black rounded-full bg-white w-9">
                          <img
                            src="/bee.png"
                            alt="icon"
                            className="w-full h-full"
                          />
                        </div>
                        <p className="overflow-auto font-mochiy_pop_one">
                          {data.username}
                        </p>
                      </div>
                      {data.isReady ? (
                        <p className="font-poppins font-semibold text-custom-midnight-blue">
                          Ready
                        </p>
                      ) : (
                        <p className="font-poppins font-semibold text-custom-dark-red">
                          Not ready
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          !isMobile && (
            <>
              <div className="relative md:h-[220px] lg:h-[420px] border-2 border-black rounded-xl bg-custom-bianca mt-12">
                <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black rounded-xl w-2/3 bg-custom-yellow text-center font-russo_one">
                  chat
                </div>
                <div className="flex flex-col justify-between mt-5 h-full">
                  <ul className="flex flex-col px-5 overflow-y-auto h-full mt-3">
                    {roomMessageData.map((message, index) => (
                      <li key={index} className="mt-3">
                        <div className="flex gap-5 items-center">
                          <div className="border border-black rounded-full bg-white w-11 h-11 mt-1">
                            <img
                              src="/bee.png"
                              alt="icon"
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-xs text-gray-600">
                              {message.username}
                            </p>
                            <p className="font-mochiy_pop_one font-bold">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* {!drawer && (
                    <form
                      action=""
                      className="py-8 px-2 relative"
                      onClick={handleSendMessage}
                    >
                      <input
                        type="text"
                        className="border border-black rounded-md w-full p-3 text-sm"
                        placeholder="Send your answer"
                        onChange={handleInputChange}
                        value={content}
                      />
                      <button className="absolute w-9 right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black text-white rounded-md">
                        <img
                          src="/send.png"
                          alt="send message"
                          className="w-full h-full"
                        />
                      </button>
                    </form>
                  )} */}
                </div>
              </div>
            </>
          )
        )}
        {!drawer && (
          <form
            action=""
            className="relative mt-3 md:mt-0"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              className="border border-black rounded-md w-full p-3 text-sm"
              placeholder="Send your answer"
              onChange={handleInputChange}
              value={content}
            />
            <button
              type="submit"
              className="absolute w-9 right-1 top-1/2 transform -translate-y-1/2 p-2 bg-black text-white rounded-md"
            >
              <img
                src="/send.png"
                alt="send message"
                className="w-full h-full"
              />
            </button>
          </form>
        )}

        <div className="flex justify-center">
          {pending ? (
            isReady ? (
              <Button
                variant="pink"
                onClick={handleGetReady}
                className="bg-custom-right-blue w-[300px] mb-7"
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="pink"
                onClick={handleGetReady}
                className="w-[300px] mb-7"
              >
                I'm ready to join!
              </Button>
            )
          ) : drawer ? (
            <Button variant="pink" className="mt-14 md:mt-2 mb-7">
              Start Drawing
            </Button>
          ) : null}
        </div>
      </div>
      {isOpenGameStart && <GameStartModal onClose={handleCloseModal} />}
      {isOpenGameOver && <GameOverModal onClose={handleGameOverModal} />}
    </div>
  );
};

export default Room;
