import { useForm } from "react-hook-form";
import { useRoomStore } from "../store/useRoomStore";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

type FormData = {
  codeword: string;
  maxPlayers: number;
  numberOfPrompts: number;
  timeLimit: number;
};

const CreateRoomModal = ({
  closeCreateRoomModal,
}: {
  closeCreateRoomModal: () => void;
}) => {
  const { createRoom, roomId } = useRoomStore();
  const navigate = useNavigate();

  // validation
  const { register, handleSubmit } = useForm<FormData>();

  useEffect(() => {
    if (roomId) {
      navigate(`/${roomId}/room`);
    }
  }, [roomId, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      await createRoom({
        codeword: data.codeword,
        maxPlayers: data.maxPlayers,
        numberOfPrompts: data.numberOfPrompts,
        timeLimit: data.timeLimit,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center font-poppins">
      <motion.div
        className="bg-white px-8 py-9 rounded-2xl sm:w-1/2 lg:w-1/3 border-2 border-black shadow-custom"
        initial={{ opacity: 0, y: -50 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl mb-4 font-bold font-russo_one">
            Create a New Room
          </h2>
          <button onClick={closeCreateRoomModal} className="mb-4">
            <img src="../../public/close.svg" alt="close button" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Codeword */}
          <div className="mb-4">
            <label className="text-xs font-semibold">Codeword</label>
            <input
              type="text"
              {...register("codeword", {
                required: "Codeword is required",
              })}
              className="w-full px-4 py-2 border-1.5 border-black rounded-lg text-sm h-[50px]"
              placeholder="Enter Codeword"
            />
          </div>

          {/* Number of Players */}
          <div className="mb-4">
            <label className="text-xs font-semibold">Number of Players</label>
            <div className="relative">
              <select
                {...register("maxPlayers")}
                className="w-full px-4 py-2 border-1.5 border-black rounded-lg text-sm h-[50px] appearance-none pr-10"
              >
                <option value="" disabled>
                  Select number of players
                </option>
                <option value="2">2 players</option>
                <option value="3">3 players</option>
                <option value="4">4 players</option>
                <option value="6">6 players</option>
                <option value="7">7 players</option>
              </select>
            </div>
          </div>

          {/* Number of Prompts */}
          <div className="mb-4">
            <label className="text-xs font-semibold">Number of Prompts</label>
            <div className="relative">
              <select
                {...register("numberOfPrompts")}
                className="w-full px-4 py-2 border-1.5 border-black rounded-lg text-sm h-[50px] appearance-none pr-10"
              >
                <option value="" disabled>
                  Select number of prompts
                </option>
                <option value="2">2 prompts</option>
                <option value="3">3 prompts</option>
                <option value="4">4 prompts</option>
                <option value="5">5 prompts</option>
              </select>
            </div>
          </div>

          {/* Time Limitation */}
          <div className="mb-4">
            <label className="text-xs font-semibold">
              Time Limitation (seconds)
            </label>
            <div className="relative">
              <select
                {...register("timeLimit")}
                className="w-full px-4 py-2 border-1.5 border-black rounded-lg text-sm h-[50px] appearance-none pr-10"
              >
                <option value="" disabled>
                  Select time limitation
                </option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
                <option value="90">90 seconds</option>
                <option value="120">120 seconds</option>
              </select>
            </div>
          </div>
          <Button className="w-full mt-4 text-2xl" variant="green">
            Create
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateRoomModal;
