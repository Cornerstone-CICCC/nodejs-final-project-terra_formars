import { useEffect, useState } from "react";
import { useRoomStore } from "../store/useRoomStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const GameOverModal = ({ onClose }: { onClose: () => void }) => {
  const [count, setCount] = useState(4);
  const navigate = useNavigate();
  const {
    roomCorrectAnswerData,
    isAllGameOver,
    roomId,
    setAllGameOver,
    clearRoomMessageData,
  } = useRoomStore();

  // Interval to handle countdown
  useEffect(() => {
    if (count === 0) {
      // If game is over, navigate and close modal
      if (isAllGameOver) {
        setAllGameOver();
        navigate(`/${roomId}/result`);
      }
      clearRoomMessageData();
      onClose();
    } else {
      const intervalId = setInterval(() => {
        setCount((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [
    count,
    isAllGameOver,
    roomId,
    setAllGameOver,
    clearRoomMessageData,
    onClose,
    navigate,
  ]);

  const handleAnimationComplete = () => {
    if (count === 0 && isAllGameOver) {
      navigate(`/${roomId}/result`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <motion.div
        className="bg-white px-8 py-9 rounded-2xl sm:w-1/2 lg:w-1/3 border-2 border-black shadow-custom"
        initial={{ opacity: 0, y: -50 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 50,
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        onAnimationComplete={handleAnimationComplete}
      >
        {isAllGameOver ? (
          <div className="flex flex-col items-center gap-4 p-6">
            <h2 className="text-3xl font-bold text-center justify-center text-green-500 font-sans italic">
              Game Over!
            </h2>
            <p>It’s time to reveal the winner!</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 p-6">
              <h2 className="text-3xl font-bold text-center font-sans italic">
                Congrats!
              </h2>
              <div className="flex flex-col items-center">
                <p className="font-poppins text-lg">
                  {roomCorrectAnswerData.answerBy}
                </p>
                <div className="border border-black rounded-full bg-white w-12">
                  <img src="/bee.png" alt="" className="w-full h-full" />
                </div>
                <p className="font-poppins text-sm">
                  {`Answer : ${roomCorrectAnswerData.answer}`}
                </p>
              </div>
            </div>
            <div className="flex justify-center w-full bg-custom-albescent-white rounded gap-2 p-2">
              <p className="text-gray-600 font-semibold">Next drawer is</p>
              <div className="flex gap-1">
                <div className="border border-black rounded-full bg-white w-6">
                  <img src="/bee.png" alt="" className="w-full h-full" />
                </div>
                <p className="font-semibold">
                  {roomCorrectAnswerData.nextDrawer}
                </p>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GameOverModal;
