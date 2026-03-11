import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

declare global {
  interface Window {
    React: any;
  }
}

// Suppress type errors
const BufferLoader = (Tone as any).BufferLoader as any;

interface Analyser extends Tone.Analyser {
  buffer: any;
}

export const WaveformPreview: React.FC<{ sampleUrl: string | null; width?: number; height?: number }> = ({
  sampleUrl,
  width = 120,
  height = 40,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sampleUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const analyser = new Tone.Analyser('waveform', 1024);
    const bufferLoader = new BufferLoader(sampleUrl, (buffer) => {
      analyser.buffer = buffer;
      const data = analyser.getValue();

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#4f6a86';
      ctx.lineWidth = 1;
      ctx.beginPath();

      const step = width / data.length;
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = (1 - (data[i] as number)) * height / 2;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    });

    bufferLoader.load();

    return () => {
      analyser.dispose();
    };
  }, [sampleUrl, width, height]);

  return <canvas ref={canvasRef} className="bg-[#1d2126]" />;
};