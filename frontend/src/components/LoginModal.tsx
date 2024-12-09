import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/useAuthStore";
import Button from "./Button";
import { motion } from "framer-motion";

type FormData = {
  username: string;
  password: string;
};

const LoginModal = ({ closeModal }: { closeModal: () => void }) => {
  const [isSignup, setIsSignup] = useState(false);
  const setSignup = () => setIsSignup(true);
  const { login, signup } = useAuthStore();

  // validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    if (isSignup) {
      signup({ username: data.username, password: data.password });
    } else {
      login({ username: data.username, password: data.password });
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        className="bg-white px-8 py-9 rounded-2xl sm:w-1/2 lg:w-1/3 border-2 border-black shadow-custom z-50"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
        }}
      >
        <div className="flex items-center justify-between">
          {isSignup ? (
            <h2 className="text-2xl mb-4 bold font-russo_one">Sign up</h2>
          ) : (
            <h2 className="text-2xl mb-4 bold font-russo_one">Log in</h2>
          )}

          <button onClick={closeModal} className="mb-4">
            <img src="../../public/close.svg" alt="close button" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2 rounded-lg">
            <label className="text-xs font-semibold font-poppins">
              User Name
            </label>
            <input
              type="text"
              {...register("username", {
                required: "Username is required",
                maxLength: {
                  value: 8,
                  message: "Username must be up to 8 characters",
                },
              })}
              className="w-full px-4 py-2 border-1.5 border-black rounded-lg text-sm h-[50px]"
              placeholder="Enter username"
            />
            {errors.username && (
              <span className="text-red-500 text-xs">
                {errors.username.message}
              </span>
            )}
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold font-poppins">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-2 border-1.5 border-black rounded-lg text-sm h-[50px] font-poppins"
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="text-red-500 text-xs">
                {errors.password.message}
              </span>
            )}
          </div>
          <Button className="w-full mt-4" variant="pink">
            {isSignup ? "Sign up" : "Log In"}
          </Button>
        </form>
        {!isSignup && (
          <div className="flex justify-center mt-4 gap-3">
            <p className="text-sm font-poppins">No account yet?</p>
            <button
              onClick={setSignup}
              className="text-sm text-custom-right-blue hover:text-custom-dark-blue font-poppins"
            >
              Create one
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginModal;
