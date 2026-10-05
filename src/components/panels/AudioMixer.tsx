import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Volume2, Mic, Sliders } from 'lucide-react';

export const AudioMixer: React.FC = () => {
  const { project, updateTrack } = useProject();

  const audioTracks = project.tracks.filter(t => t.type === 'audio');

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />
          <span className="font-semibold text-white">Audio Track Mixer:</span>
          <span className="text-[#388BFD] font-medium">{project.sequence.name}</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 flex items-center justify-center space-x-4 bg-[#141414] custom-scrollbar">
        {audioTracks.map(track => {
          const volPct = Math.round(track.volume * 100);

          return (
            <div
              key={track.id}
              className="w-28 bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3 flex flex-col items-center justify-between h-full max-h-[300px]"
            >
              {/* Track Name */}
              <div className="font-bold text-white text-center truncate w-full text-[11px] border-b border-[#2e2e2e] pb-1">
                {track.name}
              </div>

              {/* Pan Knob */}
              <div className="my-2 flex flex-col items-center">
                <span className="text-[9px] text-gray-400 mb-0.5">
                  PAN: {track.pan === 0 ? 'C' : track.pan < 0 ? `${Math.abs(Math.round(track.pan * 100))}L` : `${Math.round(track.pan * 100)}R`}
                </span>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={track.pan}
                  onChange={(e) => updateTrack(track.id, { pan: Number(e.target.value) })}
                  className="w-16 accent-[#10b981] h-1 bg-[#2e2e2e] rounded cursor-pointer"
                />
              </div>

              {/* Mute & Solo Buttons */}
              <div className="flex items-center space-x-2 my-1">
                <button
                  onClick={() => updateTrack(track.id, { muted: !track.muted })}
                  className={`w-6 h-6 rounded text-[10px] font-bold transition-colors ${
                    track.muted ? 'bg-[#ef4444] text-white font-extrabold' : 'bg-[#282828] text-gray-400 hover:text-white'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => updateTrack(track.id, { solo: !track.solo })}
                  className={`w-6 h-6 rounded text-[10px] font-bold transition-colors ${
                    track.solo ? 'bg-[#10b981] text-white font-extrabold' : 'bg-[#282828] text-gray-400 hover:text-white'
                  }`}
                >
                  S
                </button>
              </div>

              {/* Vertical Fader */}
              <div className="flex-1 w-full flex items-center justify-center my-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.02"
                  value={track.volume}
                  onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) })}
                  className="w-24 accent-[#10b981] h-1 bg-[#333] rounded cursor-pointer -rotate-90 origin-center"
                />
              </div>

              {/* Volume dB / Percentage */}
              <div className="font-mono text-[#10b981] text-[11px] font-bold mt-1">
                {volPct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
