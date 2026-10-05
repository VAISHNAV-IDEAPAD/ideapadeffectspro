import React, { useRef, useEffect } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { Activity } from 'lucide-react';

export const LumetriScopes: React.FC = () => {
  const { currentTime } = usePlayback();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear dark scopes background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Reference grid lines (0, 25%, 50%, 75%, 100% IRE)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    [0.1, 0.3, 0.5, 0.7, 0.9].forEach(ratio => {
      const y = h * ratio;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    });

    // Render RGB Parade Waveform
    const renderWave = (color: string, offsetMultiplier: number, phase: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();

      const numPoints = 60;
      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * w;
        // procedural responsive waveform based on currentTime
        const signal = 
          Math.sin(i * 0.15 + currentTime * 2 + phase) * 25 + 
          Math.cos(i * 0.3 + currentTime) * 15 + 
          Math.sin(i * 0.05) * 35;
        const y = h * 0.5 + signal * offsetMultiplier;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    renderWave('rgba(239, 68, 68, 0.75)', 0.8, 0);     // Red channel
    renderWave('rgba(34, 197, 94, 0.75)', 0.9, 1.2);   // Green channel
    renderWave('rgba(59, 130, 246, 0.75)', 0.85, 2.4);  // Blue channel
  }, [currentTime]);

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-[#388BFD]" />
          <span className="font-semibold text-white">Lumetri Scopes:</span>
          <span className="text-gray-400 text-[11px]">RGB Waveform</span>
        </div>
        <span className="font-mono text-[10px] text-gray-500">100 IRE</span>
      </div>

      <div className="flex-1 bg-black p-2 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={160}
          className="w-full h-full object-contain rounded bg-[#0a0a0a]"
        />
      </div>
    </div>
  );
};
