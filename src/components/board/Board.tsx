import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as io from "socket.io-client";
import './style.css';
const socket = io.connect(`${location.hostname}:3001`);
console.log(`connected to ${location.hostname}:3001`)
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const handleMouseDown = (event: MouseEvent) => {
      const { offsetX, offsetY } = event;
      setIsDrawing(true);
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      context.lineCap = "round";
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing) return;
      const { offsetX, offsetY } = event;
      context.lineTo(offsetX, offsetY);
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

  return (
    <canvas
      ref={canvasRef}
      className="board"
      width={1720}
      height={800}
    ></canvas>
  );
});
