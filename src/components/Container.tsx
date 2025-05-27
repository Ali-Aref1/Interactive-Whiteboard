import { Board, BoardRef } from './Board';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useState, useRef } from 'react';
import PaintBrush from '../assets/paint-brush.png';
import Eraser from '../assets/eraser.png';
import Clear from '../assets/clear.png';
import { useColorMode } from '@chakra-ui/react';

export const Container: React.FC = () => {
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('brush');
  const [size, setSize] = useState(10);
  const boardRef = useRef<BoardRef>(null);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const handleClear = () => {
    if (boardRef.current) {
      boardRef.current.clearCanvas();
    }
  };

  return (
    <div className="flex flex-col w-[calc(100%-60px)] h-[calc(100vh-60px)] m-[10px_30px]">
      <div className={`z-10 flex fixed top-[-3px] px-[15px] rounded-b-[20px] justify-between items-center w-[calc(100%-60px)] h-[60px] ${isDarkMode?"bg-[#1c2330]":"bg-[#dfdfdf]"} transition-colors!`}>
        <div className="flex items-center gap-5 h-[45px]">
          <input
            type="color"
            onChange={(e) => setColor(e.target.value)}
            className={`w-[120px] ${isDarkMode?"bg-[#1A202C]":"bg-gray-300"} rounded-[27px] border-none focus:outline-none`}
            style={{ padding: '2px 10px' }}
          />
          <div
            className={`relative cursor-pointer flex justify-center items-center rounded-full transition-all duration-200  ${tool === "brush" ? `w-[45px] h-[45px] ${isDarkMode?"bg-[#10141d]":"bg-gray-400"}` : "w-[30px] h-[30px]"}`}
            onClick={() => setTool("brush")}
          >
            <img src={PaintBrush} alt="Paint Brush" className={`w-[25px] ${isDarkMode&&"invert"}`} />
          </div>
          <div
            className={`relative cursor-pointer flex justify-center items-center rounded-full transition-all duration-200  ${tool === "eraser" ? `w-[45px] h-[45px] ${isDarkMode?"bg-[#10141d]":"bg-gray-400"}` : "w-[30px] h-[30px]"}`}
            onClick={() => setTool("eraser")}
          >
            <img src={Eraser} alt="Eraser" className={`w-[25px] ${isDarkMode&&"invert"}`} />
          </div>
          <button className="relative flex justify-center items-center rounded-full transition-all duration-200 w-[30px] h-[30px]" onClick={handleClear}>
            <img src={Clear} alt="Clear" className={`w-[25px] ${isDarkMode&&"invert"}`} />
          </button>
          <input type="range" min="1" max="70" onChange={(e) => setSize(Number(e.target.value))} />
        </div>
        <ThemeSwitcher />
      </div>
      <div className="h-full">
      
        <Board color={color} tool={tool} size={size} ref={boardRef} />
      </div>
    </div>
  );
};
