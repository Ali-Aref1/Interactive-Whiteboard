import './style.css'
import {Board} from '../board/Board'
import {ThemeSwitcher} from '../theme-switcher/ThemeSwitcher'


export const Container = () => {
  return (
    <div className="container">
        <div className="top-bar">
          <input type="color"></input>
          <ThemeSwitcher/>
        </div>
        <div className="board-container">
        <Board/>
    </div>
    </div>
    
  )
}
