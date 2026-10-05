import React, { useRef, useState, useCallback } from 'react';
import { TimelineClip as ClipType } from '../../types/project';
import { useProject } from '../../context/ProjectContext';
import { usePlayback } from '../../context/PlaybackContext';
import { Scissors, Volume2, Sparkles } from 'lucide-react';

interface TimelineClipProps {
  clip: ClipType;
  zoom: number; // px per second
  trackHeight: number;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({ clip, zoom, trackHeight }) => {
  const { 
    selectedClipId, 
    setSelectedClipId, 
    activeTool, 
    splitClip, 
    moveClip, 
    trimClip, 
    deleteClip,
    snapping,
    project,
  } = useProject();

  const { currentTime } = usePlayback();

  const isSelected = selectedClipId === clip.id;
  const isVideo = clip.type === 'video';
  const isAudio = clip.type === 'audio';
  const isTitle = clip.type === 'title';

  const leftPx = clip.startTime * zoom;
  const widthPx = Math.max(8, clip.duration * zoom);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimmingLeft, setIsTrimmingLeft] = useState(false);
  const [isTrimmingRight, setIsTrimmingRight] = useState(false);

  // Premiere clip color theme
  const getBgColor = () => {
    if (clip.colorLabel) return clip.colorLabel;
    if (isVideo) return '#204b73';
    if (isAudio) return '#1d5a44';
    if (isTitle) return '#6d2b56';
    return '#3a4b58';
  };

  // Click on clip
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If Razor tool is active, split clip at click position
    if (activeTool === 'razor') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickOffsetSec = (e.clientX - rect.left) / zoom;
      const splitTime = clip.startTime + clickOffsetSec;
      splitClip(clip.id, splitTime);
      return;
    }

    setSelectedClipId(clip.id);
  };

  // Trimming Left Handle (In-Point)
  const handleTrimLeftDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsTrimmingLeft(true);
    const startX = e.clientX;
    const initialStartTime = clip.startTime;
    const initialDuration = clip.duration;
    const initialTrimIn = clip.trimIn;

    const onPointerMove = (ev: MouseEvent) => {
      const deltaSec = (ev.clientX - startX) / zoom;
      let newStart = initialStartTime + deltaSec;
      let newDur = initialDuration - deltaSec;

      if (newDur > 0.2 && newStart >= 0) {
        if (snapping && Math.abs(newStart - currentTime) < 0.15) {
          newStart = currentTime;
          newDur = (initialStartTime + initialDuration) - newStart;
        }
        trimClip(clip.id, newStart, newDur, initialTrimIn + (newStart - initialStartTime));
      }
    };

    const onPointerUp = () => {
      setIsTrimmingLeft(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Trimming Right Handle (Out-Point)
  const handleTrimRightDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsTrimmingRight(true);
    const startX = e.clientX;
    const initialDuration = clip.duration;

    const onPointerMove = (ev: MouseEvent) => {
      const deltaSec = (ev.clientX - startX) / zoom;
      let newDur = initialDuration + deltaSec;

      if (newDur > 0.2) {
        const targetEndTime = clip.startTime + newDur;
        if (snapping && Math.abs(targetEndTime - currentTime) < 0.15) {
          newDur = currentTime - clip.startTime;
        }
        trimClip(clip.id, clip.startTime, Math.max(0.2, newDur));
      }
    };

    const onPointerUp = () => {
      setIsTrimmingRight(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Move Clip Dragging
  const handleBodyPointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'razor') return;
    if (e.button !== 0) return; // only left click
    
    setSelectedClipId(clip.id);
    setIsDragging(true);
    const startX = e.clientX;
    const initialStartTime = clip.startTime;

    const onPointerMove = (ev: MouseEvent) => {
      const deltaSec = (ev.clientX - startX) / zoom;
      let newStart = initialStartTime + deltaSec;
      if (newStart < 0) newStart = 0;

      // Snapping to playhead
      if (snapping && Math.abs(newStart - currentTime) < 0.15) {
        newStart = currentTime;
      }

      moveClip(clip.id, newStart);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      onClick={handleClick}
      onPointerDown={handleBodyPointerDown}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        height: `${trackHeight - 4}px`,
        backgroundColor: getBgColor(),
      }}
      className={`absolute top-[2px] rounded-sm select-none cursor-pointer flex items-center justify-between group overflow-hidden shadow-sm transition-shadow ${
        activeTool === 'razor' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      } ${
        isSelected
          ? 'ring-2 ring-white ring-offset-1 ring-offset-black z-20 brightness-110'
          : 'hover:brightness-105 border border-black/20'
      }`}
    >
      {/* Left Trim Handle (In-Point) */}
      <div
        onPointerDown={handleTrimLeftDown}
        title="Trim Head"
        className={`w-2 h-full absolute left-0 top-0 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/40 transition-opacity z-30 ${
          isTrimmingLeft ? 'opacity-100 bg-[#388BFD]' : ''
        }`}
      >
        <div className="w-[2px] h-3 bg-white/70 absolute left-0.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Clip Content Details */}
      <div className="flex-1 px-2 flex items-center space-x-1.5 overflow-hidden pointer-events-none">
        {isAudio ? (
          <Volume2 className="w-3 h-3 text-emerald-200 shrink-0 opacity-80" />
        ) : isTitle ? (
          <span className="text-[10px] font-bold text-pink-200 shrink-0">T</span>
        ) : (
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-300 shrink-0 opacity-80" />
        )}
        <span className="text-[11px] font-semibold text-white/95 truncate tracking-tight">
          {clip.name}
        </span>
        <span className="text-[9px] text-white/60 font-mono hidden sm:inline shrink-0">
          [{clip.duration.toFixed(1)}s]
        </span>
      </div>

      {/* Audio Waveform Emulation Overlay */}
      {isAudio && (
        <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none px-1">
          {Array.from({ length: Math.min(60, Math.floor(widthPx / 4)) }).map((_, idx) => {
            const h = 20 + Math.sin(idx * 0.4 + clip.startTime) * 15 + Math.cos(idx * 0.8) * 10;
            return (
              <div 
                key={idx} 
                style={{ height: `${Math.max(4, h)}%` }} 
                className="w-[2px] bg-white rounded-full" 
              />
            );
          })}
        </div>
      )}

      {/* Transition In Badge */}
      {clip.transitionIn && clip.transitionIn.type !== 'none' && (
        <div 
          style={{ width: `${Math.min(widthPx / 3, clip.transitionIn.duration * zoom)}px` }}
          className="absolute left-0 top-0 bottom-0 bg-[#388bfd]/30 border-r border-[#388bfd]/60 pointer-events-none flex items-center px-1"
          title={`Transition In: ${clip.transitionIn.type}`}
        >
          <Sparkles className="w-2.5 h-2.5 text-white/70" />
        </div>
      )}

      {/* Transition Out Badge */}
      {clip.transitionOut && clip.transitionOut.type !== 'none' && (
        <div 
          style={{ width: `${Math.min(widthPx / 3, clip.transitionOut.duration * zoom)}px` }}
          className="absolute right-0 top-0 bottom-0 bg-[#388bfd]/30 border-l border-[#388bfd]/60 pointer-events-none flex items-center justify-end px-1"
          title={`Transition Out: ${clip.transitionOut.type}`}
        >
          <Sparkles className="w-2.5 h-2.5 text-white/70" />
        </div>
      )}

      {/* Right Trim Handle (Out-Point) */}
      <div
        onPointerDown={handleTrimRightDown}
        title="Trim Tail"
        className={`w-2 h-full absolute right-0 top-0 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/40 transition-opacity z-30 ${
          isTrimmingRight ? 'opacity-100 bg-[#388BFD]' : ''
        }`}
      >
        <div className="w-[2px] h-3 bg-white/70 absolute right-0.5 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};
