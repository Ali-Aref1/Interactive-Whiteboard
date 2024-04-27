import React, { useRef, useEffect, useState } from 'react';
import './style.css';

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

    const handleMouseDown = (event: MouseEvent) => {
      const { offsetX, offsetY } = event;
      setIsDrawing(true);
      context.beginPath(); // Start a new path
      context.moveTo(offsetX, offsetY); // Move to the starting point
      context.lineWidth = size; // Set the stroke size based on the 'size' prop
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing) return;
      const { offsetX, offsetY } = event;
      if (tool === "brush") {
        context.lineTo(offsetX, offsetY); // Draw line to the current mouse position
        context.strokeStyle = color; // Set the stroke color
        context.lineWidth = size; // Set the stroke size based on the 'size' prop
        context.stroke();
      } else if (tool === "eraser") {
        context.clearRect(offsetX, offsetY, size, size); // Erase at mouse position
      }
      const root: any = this;
      if (root) {
        if(root.timeout) clearTimeout(root.timeout);
        root.timeout = setTimeout(() => {
          var base64ImageData = canvas.toDataURL("image/png");
        }, 1000);
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing, color]);

  return (
    <canvas
      ref={canvasRef}
      className="board"
      width={1720} // Set your desired width
      height={800} // Set your desired height
    ></canvas>
  );
};
