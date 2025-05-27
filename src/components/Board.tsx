import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as io from "socket.io-client";
import { User } from './interfaces/User';
import { MousePointer } from './MousePointer';
const socket = io.connect(`${window.location.hostname}:3001`);
var temp: string = "";

export interface BoardProps {
  color: string;
  tool: string;
  size: number;
}

export interface BoardRef {
  clearCanvas: () => void;
}

export const Board = forwardRef<BoardRef, BoardProps>(({ color, tool, size }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [users, setUsers] = useState<User[]>([]);

  socket.on('connect', () => {
    socket.emit('get-users'); // Join a specific room
  })

  const listUsers = (users: User[]) => {
    setUsers(users);
    console.log(users);
  }

  useImperativeHandle(ref, () => ({
    clearCanvas
  }));

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      context.strokeStyle = 'white';
      context.rect(0, 0, canvas.width, canvas.height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      sendCanvasData();
    }
  };


  const sendCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    if (temp === dataURL) {
      return;
    }
    socket.emit('canvas-data', dataURL);
    console.log("Canvas data sent");
    temp = dataURL;
  };
    
 const handleTrackMouse = ()=>{
    canvasRef.current?.addEventListener('mousemove', (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      socket.emit('track-mouse', { x, y });
    });
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const getScaledCoords = (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseDown = (event: MouseEvent) => {
      const { x, y } = getScaledCoords(event);
      setIsDrawing(true);
      context.beginPath();
      context.moveTo(x, y);
      context.lineCap = "round";
    };

    const handleMouseMove = (event: MouseEvent) => {
      handleTrackMouse();
      if (!isDrawing) return;
      const { x, y } = getScaledCoords(event);
      context.lineTo(x, y);
      context.lineWidth = size;
      context.strokeStyle = tool === "brush" ? color : 'white';
      context.globalCompositeOperation = tool === "brush" ? 'source-over' : 'destination-out';
      context.stroke();
    };

    const handleMouseUp = (event: MouseEvent) => {
      handleMouseMove(event);
      setIsDrawing(false);
      sendCanvasData();
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    };
    const handleMouseUpdate = (data:any) =>{
      const user = users.find(user => user.id === data.id);
      if (user) {
        user.mouse = data.mouse;
        setUsers([...users]);
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.changedTouches[0];
      const mouseEvent = new MouseEvent('mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    };

    const handleIncomingData = (dataURL: string) => {
      const image = new Image();
      image.src = dataURL;
      image.onload = () => {
        context.drawImage(image, 0, 0);
      };
    };

    socket.on('canvas-data', handleIncomingData);
    socket.on('list-users', listUsers);
    socket.on('track-mouse', handleMouseUpdate);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDrawing, color, tool, size]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Try to notify the server and close the socket
      socket.emit('manual-disconnect');
      socket.close();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Do not call socket.close() here to avoid issues with React Strict Mode
    };
  }, []);

  return (
    <div
      style={{
      position: "relative",
      width: "100%",
      maxWidth: "1720px",
      aspectRatio: "1720 / 700",
      margin: "70px auto 0 auto",
      }}
      className="border-2 border-black block relative shadow-[5px_10px_20px_black] rounded-[15px] bg-white"
    >
      <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        borderRadius: "15px",
      }}
      width={1720}
      height={700}
      ></canvas>
      {users.filter((user)=>{return user.id!=socket.id}).map((user) => (
        <MousePointer user={user} key={user.id} />
      ))} 
      <button className='z-20'>test</button> 
    </div>
  );
});
