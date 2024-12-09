import { useResultStore } from "../store/useResultStore";
import { useNavigate } from "react-router-dom";
import { useRoomStore } from "../store/useRoomStore";
import { getSocket } from "../socket/socket.client";
import Button from "./Button";

const Result = () => {
  const socket = getSocket();
  const { results } = useResultStore();
  const navigate = useNavigate();
  const { leaveRoom, roomId } = useRoomStore();

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate("/");
  };

  const handleRematch = async () => {
    await socket.emit("room:rematch", roomId);
    navigate(`/${roomId}/room`);
  };

  return (
    <div className="flex flex-col justify-center gap-10">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-4xl font-russo_one mt-32">Result</h2>
          <p className="text-sm md:text-base">
            Thank you for playing. It’s all about enjoying the game!
          </p>
        </div>
        <div className="relative w-full md:w-1/2 h-full border-2  border-black rounded-xl bg-custom-bianca mt-12 shadow-custom_green_light">
          <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black rounded-xl w-2/3 bg-white text-center font-russo_one">
            Score
          </div>
          <ul className="flex flex-col gap-2 h-full p-10">
            {results.map((result, index) => (
              <li
                key={index}
                className="flex font-poppins font-semibold text-lg justify-around items-center italic"
              >
                <p className="font-medium">
                  No.<span>{index + 1}</span>
                </p>
                <p>{result.username}</p>
                <p>{result.score}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button
          variant="pink"
          onClick={handleLeaveRoom}
          className="w-full md:w-1/3"
        >
          Leave Room
        </Button>
        <Button
          variant="yellow"
          onClick={handleRematch}
          className="w-full md:w-1/3"
        >
          Rematch
        </Button>
      </div>
    </div>
  );
};

export default Result;
