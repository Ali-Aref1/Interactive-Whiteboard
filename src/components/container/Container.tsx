import './style.css'
import {Board} from '../board/Board'
import {ThemeSwitcher} from '../theme-switcher/ThemeSwitcher'
import {useState} from 'react'
import PaintBrush from '../../assets/paint-brush.png'
import Eraser from '../../assets/eraser.png'

export const Container = () => {
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('brush');
  const [size, setSize] = useState(10);
  const theme = localStorage.getItem('chakra-ui-color-mode');
  return (
    <div className="container">
        <div className="top-bar">
          <div className="top-left">
          <input type="color" onChange={(e)=>setColor(e.target.value)}></input>
          <button className={tool=="brush" ? "tool-button active" : "tool-button"} onClick={()=>setTool("brush")}><img src={PaintBrush} alt="Paint Brush" className={theme=="light" ? "tool-icon" : "tool-icon white"}/></button>
          <button className={tool=="eraser" ? "tool-button active" : "tool-button"}onClick={()=>setTool("eraser")}><img src={Eraser} alt="Eraser" className={theme=="light" ? "tool-icon" : "tool-icon white"}/></button>
          <input type="range" min="1" max="70" onChange={(e)=>setSize(Number(e.target.value))}></input>
          </div>
          <ThemeSwitcher/>
        </div>
        <div className="board-container">
        <Board color={color} tool={tool} size={size}/>
    </div>
    </div>
    
  )
}
