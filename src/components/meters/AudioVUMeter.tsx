import React, { useEffect, useState } from 'react';
import { audioEngine, PeakLevels } from '../../engine/AudioEngine';
import { Volume2, VolumeX } from 'lucide-react';

export const AudioVUMeter: React.FC = () => {
  const [levels, setLevels] = useState<PeakLevels>({
    left: 0,
    right: 0,
    leftDb: -60,
    rightDb: -60,
    peakLeft: 0,
    peakRight: 0,
  });

  const [masterVol, setMasterVol] = useState(85);

  useEffect(() => {
    let animId: number;

    const updateMeter = () => {
      const data = audioEngine.getPeakLevels();
      setLevels(data);
      animId = requestAnimationFrame(updateMeter);
    };

    animId = requestAnimationFrame(updateMeter);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    audioEngine.setMasterVolume(val / 100);
  };

  // Convert dB (-60 to 0) to height percentage (0 to 100%)
  const dbToHeight = (db: number) => {
    if (db <= -60) return 0;
    return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
  };

  const leftHeight = dbToHeight(levels.leftDb);
  const rightHeight = dbToHeight(levels.rightDb);

  const dbTicks = [0, -6, -12, -18, -24, -36, -48, -60];

  return (
    <div className="w-14 bg-[#181818] border-l border-[#2a2a2a] flex flex-col items-center py-2 select-none z-20 text-[9px] font-mono shrink-0">
      {/* Label */}
      <span className="text-gray-400 font-bold mb-1 tracking-tighter">MASTER</span>

      {/* Dual Peak Bar Container */}
      <div className="flex-1 w-full flex items-center justify-center px-1.5 space-x-1 relative">
        {/* dB Tick Marks (Left Side) */}
        <div className="flex flex-col justify-between h-full py-1 text-gray-500 text-[8px] pointer-events-none select-none">
          {dbTicks.map(db => (
            <span key={db} className="leading-none text-right">
              {db === 0 ? '0' : db}
            </span>
          ))}
        </div>

        {/* Left Channel Bar */}
        <div className="w-2.5 h-full bg-[#101010] rounded-sm relative overflow-hidden flex flex-col justify-end p-0.5 border border-[#2a2a2a]">
          <div 
            style={{ height: `${leftHeight}%` }}
            className="w-full bg-gradient-to-t from-emerald-500 via-yellow-400 to-red-500 rounded-sm transition-all duration-75"
          />
        </div>

        {/* Right Channel Bar */}
        <div className="w-2.5 h-full bg-[#101010] rounded-sm relative overflow-hidden flex flex-col justify-end p-0.5 border border-[#2a2a2a]">
          <div 
            style={{ height: `${rightHeight}%` }}
            className="w-full bg-gradient-to-t from-emerald-500 via-yellow-400 to-red-500 rounded-sm transition-all duration-75"
          />
        </div>
      </div>

      {/* Numerical dB Output */}
      <div className="text-[9px] text-[#00e5ff] font-mono mt-1 text-center font-bold">
        {levels.leftDb > -58 ? `${levels.leftDb.toFixed(0)}dB` : '-inf'}
      </div>

      {/* Mini Master Volume Slider */}
      <div className="w-full px-2 mt-2 flex flex-col items-center">
        <Volume2 className="w-3 h-3 text-gray-400 mb-1" />
        <input
          type="range"
          min="0"
          max="120"
          value={masterVol}
          onChange={(e) => handleMasterChange(Number(e.target.value))}
          className="w-10 accent-[#1473E6] h-1 bg-[#333] rounded cursor-pointer"
          title={`Master Volume: ${masterVol}%`}
        />
      </div>
    </div>
  );
};
