import { useState } from "react";
import LoginModal from "./LoginModal";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useRoomStore } from "../store/useRoomStore";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const { logout, authUser } = useAuthStore();
  const { leaveRoom } = useRoomStore();
  const navigate = useNavigate();

  // logout
  const onLogoutClick = () => {
    logout();
    leaveRoom();
    navigate("/");
  };

  const onLogoClick = () => {
    leaveRoom();
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center py-5 px-2 md:px-8">
      <div
        className="font-russo_one cursor-pointer w-40 h-30"
        onClick={onLogoClick}
      >
        <img
          src="/logo.png"
          alt="logo"
          className="w-full h-auto object-cover "
        />
      </div>
      <nav>
        {authUser ? (
          <button
            onClick={onLogoutClick}
            className="text-sm font-semibold rounded-lg px-3 py-2 hover:bg-gray-300 hover:text-gray-600 transition-all duration-300"
          >
            LOG OUT
          </button>
        ) : (
          <button
            onClick={openModal}
            className="text-sm font-semibold rounded-lg px-3 py-2 hover:bg-gray-300 hover:text-gray-600  transition-colors duration-300"
          >
            LOG IN
          </button>
        )}
      </nav>
      {isModalOpen && <LoginModal closeModal={closeModal} />}
    </div>
  );
};

export default Header;
