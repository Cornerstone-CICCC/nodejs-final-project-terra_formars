import "./App.css";
import Header from "./components/Header";
import PendingRoom from "./components/PendingRoom";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import Home from "./components/Home";
import Result from "./components/Result";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const { checkAuth, checkingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (checkingAuth) {
    return null;
  }

  return (
    <div className="App h-screen px-6 sm:px-10 lg:px-24">
      <BrowserRouter>
        <Header />
        <RoutesWrapper />
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

const RoutesWrapper = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />
        <Route
          path="/:roomId/room"
          element={
            <PageWrapper>
              <PendingRoom />
            </PageWrapper>
          }
        />
        <Route
          path="/:roomId/result"
          element={
            <PageWrapper>
              <Result />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export default App;
