import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { User } from './interfaces/User';
import { MousePointer } from './MousePointer';
import { useSocket } from '../contexts/useSocket';
import { useAuth } from '../contexts/useAuth'; // <-- import useAuth
import { Navigate } from 'react-router-dom';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

var temp: string = "";

export interface BoardProps {
  color: string;
  tool: string;
  size: number;
}

export interface BoardRef {
  clearCanvas: () => void;
}

interface ErrorType{
  message: string;
  id: string;
}

export const Board = forwardRef<BoardRef, BoardProps>(({ color, tool, size }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<ErrorType | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const socket = useSocket();
  const { user } = useAuth(); // <-- get user and setUser from context
  const nav= useNavigate();
  if(!user) return <Navigate to="/login" replace={true} />; // Redirect to login if user is not authenticated

  const handleLogout = () => {
    socket.close();
    nav("/");
  };
  useEffect(() => {

    const handleListUsers = (usersList: User[]) => {

      setUsers(usersList);
      console.log("users:",usersList);
      console.log(socket.id);
      console.log(users[0].socketId);
    };
    
    socket.on('list-users', handleListUsers);
    const handleConnect = () => {
      socket.emit('new-login',user);
    };

    socket.on('auth-error',()=>{
      setError({message:"You are already logged in from another window. Would you like to connect here instead?", id: "auth-error"});
      
    })
    
    socket.on('connect', handleConnect);

    socket.on('logout',()=>{
      socket.close();
      setError({message:"You have been logged out from another window.", id: "logout"});

    })
    
    // Clean up event listener on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('list-users', handleListUsers);
    };
  }, [socket]); // Only re-register if socket changes


  const listUsers = (users: User[]) => {
    setUsers(users);
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
    if(socket && socket.connected){
    socket.emit('canvas-data', dataURL);
    console.log("Canvas data sent");
    }
    temp = dataURL;
  };
    
// Throttle mouse tracking to reduce server load
const lastEmitRef = useRef<number>(0);

const handleTrackMouse = (event: MouseEvent) => {
  const now = Date.now();

  if (now - lastEmitRef.current < 25) return; // Emit at most every 25ms
  lastEmitRef.current = now;
  const canvas = canvasRef.current;
  if (!canvas || !event) return;
  const rect = canvas.getBoundingClientRect();

  // Calculate relative x and y in the range [0, 1720] and [0, 700]
  const relX = ((event.clientX - rect.left) / rect.width) * 1720;
  const relY = ((event.clientY - rect.top) / rect.height) * 700;

  setMouse({ x: relX, y: relY });

  socket.emit('track-mouse', { x: relX, y: relY });
};

const handleLogOutElsewhere = () => {
  console.log("Logging out from another window");
  socket.emit('logmeout', user);
  setError(null);
}
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
      handleTrackMouse(event);
      if (!isDrawing) return;
      const { x, y } = getScaledCoords(event);
      context.lineTo(x, y);
      context.lineWidth = size;
      context.strokeStyle = tool === "brush" ? color : 'white';
      context.globalCompositeOperation = tool === "brush" ? 'source-over' : 'destination-out';
      context.stroke();
    };

    const handleMouseUp = (event: MouseEvent) => {
      console.log(socket.connected);
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


    const handleMouseUpdate = (data: {id:string,mouse:{x:number,y:number}}) => {
      if (data.id === socket.id) return;
      console.log("Mouse update from:", data.id, "Mouse position:", data.mouse);
      setUsers(users =>
        users.map(user =>
          user.socketId === data.id
            ? {
                ...user,
                mouse:data.mouse
              }
            : user
        )
      );
    };

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

    if (socket && !socket.connected) {
      socket.connect();
    }

    const handleBeforeUnload = () => {
      socket.close();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.close();
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
      {users
        .filter((user) => user.socketId !== socket.id)
        .map((user) => (
          <MousePointer user={user} key={user.socketId} localMouse={mouse} />
        ))}
      <Modal isOpen={!!error} onClose={() => setError(null)} isCentered size={"lg"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Error</ModalHeader>
          <ModalBody>
            {error?.message}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => {
                if (error?.id === "auth-error") {
                handleLogOutElsewhere();
                } else if (error?.id === "logout") {
                handleLogout();
                } else {
                setError(null);
                }
              
              }}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});


