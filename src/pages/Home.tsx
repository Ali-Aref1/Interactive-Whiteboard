import { useColorMode } from "@chakra-ui/react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { Link } from "react-router-dom";

export const Home = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const colorModeClass = isDarkMode
    ? "bg-[#10141D] text-white hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.4)]"
    : "bg-[#F7F8FA] text-black border-gray-500! border-2! hover:shadow-[0_0_16px_4px_rgba(0,102,255,0.25)]";
  return (
    <>
    <div className='flex justify-end absolute w-full p-2 z-20'><ThemeSwitcher/></div>
    <div className="bg-home relative h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex-1 flex justify-center">
          <p className="text-[48px] text-center">Welcome to InkSync!</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-32">
        <Link to ="/login">
        <div
          className={`w-42 text-center text-[32px] px-2 rounded-lg ${colorModeClass} cursor-pointer transition-shadow duration-300`}
        >
          LOG IN
        </div>
        </Link>
        <Link to ="/register">
        <div
          className={`w-42 text-center text-[32px] px-2 rounded-lg ${colorModeClass} cursor-pointer transition-shadow duration-300`}
        >
          REGISTER
        </div>
        </Link>
      </div>
    </div>
    </>
  );
}
