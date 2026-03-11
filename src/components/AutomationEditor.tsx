import React, { useEffect, useRef, useState } from 'react';

interface AutomationPoint {
  x: number;
  value: number;
}

interface AutomationEditorProps {
  points: AutomationPoint[];
  onChange: (points: AutomationPoint[]) => void;
  width?: number;
  height?: number;
}

export const AutomationEditor: React.FC<AutomationEditorProps> = ({
  points,
  onChange,
  width = 200,
  height = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Render the curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#3a4048';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw curve
    if (points.length > 1) {
      ctx.strokeStyle = '#4f6a86';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x * width, (1 - points[0].value) * height);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * width, (1 - points[i].value) * height);
      }
      ctx.stroke();
    }

    // Draw points
    ctx.fillStyle = '#ff9c2f';
    points.forEach((point, index) => {
      const x = point.x * width;
      const y = (1 - point.value) * height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      if (selectedPoint === index) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [points, width, height, selectedPoint]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / width;
    const y = 1 - (e.clientY - rect.top) / height;

    // Find closest point
    let minDist = Infinity;
    let closestIndex = -1;
    points.forEach((point, index) => {
      const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.value - y, 2));
      if (dist < minDist && dist < 0.05) {
        minDist = dist;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      setSelectedPoint(closestIndex);
      setIsDrawing(true);
    } else {
      const newPoints = [...points, { x, value: y }].sort((a, b) => a.x - b.x);
      onChange(newPoints);
      setSelectedPoint(newPoints.length - 1);
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedPoint === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / height));

    const newPoints = [...points];
    newPoints[selectedPoint] = { x, value: y };
    onChange(newPoints);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setSelectedPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="bg-[#1d2126] cursor-crosshair"
    />
  );
};