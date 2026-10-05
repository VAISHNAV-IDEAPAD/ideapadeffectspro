import React from 'react';
import { TimelineTrack } from '../../types/project';
import { useProject } from '../../context/ProjectContext';
import { Eye, EyeOff, Lock, Unlock, Volume2, VolumeX } from 'lucide-react';

interface TrackHeaderProps {
  track: TimelineTrack;
  width: number;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track, width }) => {
  const { updateTrack } = useProject();

  const isVideo = track.type === 'video';

  return (
    <div 
      style={{ width: `${width}px`, height: `${track.height}px` }}
      className={`border-b border-r border-[#2d2d2d] flex items-center justify-between px-2 select-none shrink-0 ${
        isVideo ? 'bg-[#1b2229]' : 'bg-[#192621]'
      }`}
    >
      {/* Left: Track Target & Name */}
      <div className="flex items-center space-x-1.5">
        {/* Source Target Box (Premiere Pro V1/A1 target patching) */}
        <button
          onClick={() => updateTrack(track.id, { target: !track.target })}
          title={`Target ${track.name}`}
          className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-colors ${
            track.target 
              ? 'bg-[#1473E6] text-white shadow-sm' 
              : 'bg-[#292929] text-[#777] hover:text-[#aaa]'
          }`}
        >
          {track.name.slice(0, 2)}
        </button>

        <span className="font-semibold text-[11px] text-[#ccc] truncate max-w-[55px]">
          {track.name}
        </span>
      </div>

      {/* Right: Controls (Lock, Eye, Mute, Solo) */}
      <div className="flex items-center space-x-1">
        {/* Lock Track Toggle */}
        <button
          onClick={() => updateTrack(track.id, { locked: !track.locked })}
          title={track.locked ? "Unlock Track" : "Lock Track"}
          className={`p-1 rounded hover:bg-[#333] transition-colors ${track.locked ? 'text-[#f59e0b]' : 'text-[#666]'}`}
        >
          {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>

        {isVideo ? (
          /* Video Visibility Eye */
          <button
            onClick={() => updateTrack(track.id, { visible: !track.visible })}
            title={track.visible ? "Hide Track" : "Show Track"}
            className={`p-1 rounded hover:bg-[#333] transition-colors ${track.visible ? 'text-[#aaa] hover:text-white' : 'text-[#ef4444]'}`}
          >
            {track.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        ) : (
          /* Audio Mute & Solo */
          <div className="flex items-center space-x-1">
            <button
              onClick={() => updateTrack(track.id, { muted: !track.muted })}
              title="Mute Track (M)"
              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                track.muted ? 'bg-[#ef4444] text-white font-extrabold' : 'bg-[#2a2a2a] text-[#777] hover:text-[#aaa]'
              }`}
            >
              M
            </button>
            <button
              onClick={() => updateTrack(track.id, { solo: !track.solo })}
              title="Solo Track (S)"
              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                track.solo ? 'bg-[#10b981] text-white font-extrabold' : 'bg-[#2a2a2a] text-[#777] hover:text-[#aaa]'
              }`}
            >
              S
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
