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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const drawWaveform = (data: number[]) => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#4f6a86';
      ctx.lineWidth = 1;
      ctx.beginPath();

      const step = width / data.length;
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = (1 - data[i]) * height / 2;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    if (sampleUrl) {
      const analyser = new Tone.Analyser('waveform', 1024);
      const bufferLoader = new BufferLoader(sampleUrl, (buffer) => {
        // Note: Tone.Analyser doesn't directly take buffer; assuming it's set up for live audio
        // For static buffer, use buffer.getChannelData(0) or similar
        const channelData = buffer.getChannelData(0);
        const data = Array.from(channelData.slice(0, 256)) as number[]; // Sample first 256 points
        drawWaveform(data);
      });

      bufferLoader.load();

      return () => {
        analyser.dispose();
      };
    } else {
      // Generate synthetic waveform
      const data = Array.from({ length: 256 }, () => Math.sin(Math.random() * Math.PI * 2) * 0.5 + 0.5);
      drawWaveform(data);
    }
  }, [sampleUrl, width, height]);

  return <canvas ref={canvasRef} className="bg-[#1d2126]" />;
};