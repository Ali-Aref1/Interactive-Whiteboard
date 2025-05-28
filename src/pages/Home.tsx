import { useColorMode } from "@chakra-ui/react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { handleLogout } from "../utils";
import { FaGear } from "react-icons/fa6";

export const Home = () => {
  const { colorMode } = useColorMode();
  const { user,setUser } = useAuth();
  const nav =  useNavigate();
  const isDarkMode = colorMode === "dark";
  const colorModeClass = isDarkMode
    ? "bg-[#10141D] text-white hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.4)]"
    : "bg-[#F7F8FA] text-black border-gray-500! border-2! hover:shadow-[0_0_16px_4px_rgba(0,102,255,0.25)]";
  return (
    <>
    <div className='flex justify-end absolute w-full p-2 z-20 gap-5'>
      <Link to="/settings">
      <FaGear
      size={30}
      className="transition-transform duration-300 hover:animate-spin hover:scale-125"
      style={{ cursor: "pointer" }}
      />
      </Link>
      <ThemeSwitcher />
    </div>
    <div className="bg-home relative h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex-1 flex justify-center">
          <p className="text-[48px] text-center">{`Welcome to InkSync${user?`, ${user.username}`:``}!`}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-32">
        {user?
        
        <>
        <Link to ="/draw">
        <div
          className={`w-42 text-center text-[32px] px-2 rounded-lg ${colorModeClass} cursor-pointer transition-shadow duration-300`}
        >
          DRAW

        </div>
        </Link>
        <div
          className={`w-42 text-center text-[32px] px-2 rounded-lg ${colorModeClass} cursor-pointer transition-shadow duration-300`}
          onClick={()=>{handleLogout(setUser,nav);}}
        >
          LOG OUT
        </div>
        </>:<><Link to ="/login">
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
        </>
        
        }
        
        
      </div>
    </div>
    </>
  );
}
