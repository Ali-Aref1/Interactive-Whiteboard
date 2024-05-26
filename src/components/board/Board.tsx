import React, { useRef, useEffect, useState } from 'react';
import * as io from "socket.io-client";
import './style.css';
const socket = io.connect('http://192.168.1.10:3001');
console.log(socket);
var temp: string = "";

export interface BoardProps {
  color: string;
  tool: string;
  size: number;
}

export const Board: React.FC<BoardProps> = ({ color, tool, size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const sendCanvasData = () => {
      const dataURL = canvas.toDataURL();
      if (temp === dataURL) {
        return;
      }
      socket.emit('canvas-data', dataURL);
      temp = dataURL;
    }

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
      if (tool === "brush") {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = color;
      } else if (tool === "eraser") {
        context.strokeStyle = 'white';
      }
      context.lineTo(offsetX, offsetY);
      context.lineWidth = size;
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
};
