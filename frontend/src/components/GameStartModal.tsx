import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoomStore } from "../store/useRoomStore";

const GameStartModal = ({ onClose }: { onClose: () => void }) => {
  const [count, setCount] = useState(3);
  const [stage, setStage] = useState<"enter" | "countdown" | "exit">("enter");
  const { updatePending } = useRoomStore();
  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setStage("countdown");

      const countdownInterval = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount === 1) {
            clearInterval(countdownInterval);
            setStage("exit");
            return 1;
          }
          return prevCount - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    }, 900);

    return () => {
      clearTimeout(enterTimer);
    };
  }, []);

  useEffect(() => {
    if (stage === "exit") {
      const exitTimer = setTimeout(() => {}, 900);

      const closeTimer = setTimeout(() => {
        onClose();
        updatePending();
      }, 900);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [stage, onClose, updatePending]);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
      <motion.div
        initial={{ x: "-100vw" }}
        animate={{
          x: stage === "enter" ? 0 : stage === "countdown" ? 0 : "100vw",
        }}
        transition={{
          duration: 0.9,
          type: "tween",
        }}
      >
        <div className="bg-white py-12 rounded-2xl w-[400px] border-2 border-black shadow-custom">
          <h2 className="text-2xl font-semibold text-center mb-4 font-mochiy_pop_one">
            Game starts in...
          </h2>
          <div className="text-center text-4xl font-semibold">
            <p
              className={`font-poppins font-semibold ${
                count === 3
                  ? "text-green-500"
                  : count === 2
                  ? "text-yellow-500"
                  : count === 1
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {stage === "enter" || stage === "countdown" || stage === "exit"
                ? count
                : ""}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameStartModal;
