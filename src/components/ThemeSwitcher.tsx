import { useColorMode } from '@chakra-ui/react';
export const ThemeSwitcher = () => {
        
    const { colorMode, setColorMode } = useColorMode();

    const toggleColorMode = () => {
      setColorMode(colorMode === 'light' ? 'dark' : 'light');
    };
    const isDarkMode = colorMode === 'dark';

    return (
      <div
        onClick={toggleColorMode}
        className={`
          transition-all! w-14 h-8 flex items-center cursor-pointer ${isDarkMode ? "bg-[#10141D]" : "bg-[#99A1AF]"} rounded-full p-1 duration-300 relative
        `}
        aria-label="Toggle theme"
      >
        <div
          className={`
            absolute top-1 transition-all!
            ${isDarkMode ? "bg-[#1c2330] translate-x-6" : "bg-white translate-x-0"}
            w-6 h-6 rounded-full shadow-md
          `}  
        ></div>
        <span className="sr-only">Toggle theme</span>
      </div>
    );
}
