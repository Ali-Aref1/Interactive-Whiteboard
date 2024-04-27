import './style.css'
import {Board} from '../board/Board'
export const Container = () => {
  return (
    <div className="container">
        <div className="color-picker"><input type="color"></input></div>
        <div className="board-container">
        <Board/>
    </div>
    </div>
    
  )
}
