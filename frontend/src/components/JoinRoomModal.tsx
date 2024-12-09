import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRoomStore } from "../store/useRoomStore";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 

type FormData = {
  codeword: string;
};

const JoinRoomModal: React.FC<{ closeJoinRoomModal: () => void }> = ({
  closeJoinRoomModal,
}) => {
  const { joinRoom, roomId } = useRoomStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      navigate(`/${roomId}/room`);
    }
  }, [roomId, navigate]);

  // validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    joinRoom(data.codeword);
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
          <h2 className="text-2xl mb-4 font-bold font-russo_one">Join Room</h2>
          <button onClick={closeJoinRoomModal} className="mb-4">
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
            {errors.codeword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.codeword.message}
              </p>
            )}
          </div>

          <Button className="w-full mt-4 text-2xl" variant="green">
            Join
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinRoomModal;
