import React, { useRef, useCallback } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useProject } from '../../context/ProjectContext';
import { secondsToTimecode } from '../../utils/timecode';

interface TimeRulerProps {
  totalDuration: number;
  zoom: number; // pixels per second
  headerWidth: number; // track header offset
}

export const TimeRuler: React.FC<TimeRulerProps> = ({ totalDuration, zoom, headerWidth }) => {
  const { currentTime, seek } = usePlayback();
  const { project, snapping } = useProject();
  const rulerRef = useRef<HTMLDivElement | null>(null);

  // Time ticks calculation
  // Interval depends on zoom level
  let tickInterval = 1; // 1 second
  if (zoom < 15) tickInterval = 5;
  else if (zoom < 30) tickInterval = 2;
  else if (zoom > 80) tickInterval = 0.5;

  const totalWidth = Math.max(1200, totalDuration * zoom);
  const numTicks = Math.ceil(totalDuration / tickInterval);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    
    const updateTimeFromEvent = (ev: MouseEvent | React.PointerEvent) => {
      const offsetX = ev.clientX - rect.left;
      let newTime = Math.max(0, Math.min(totalDuration, offsetX / zoom));

      // Snapping to playhead or in/out points
      if (snapping) {
        if (project.sequence.inPoint !== null && Math.abs(newTime - project.sequence.inPoint) < 0.2) {
          newTime = project.sequence.inPoint;
        } else if (project.sequence.outPoint !== null && Math.abs(newTime - project.sequence.outPoint) < 0.2) {
          newTime = project.sequence.outPoint;
        }
      }

      seek(newTime);
    };

    updateTimeFromEvent(e);

    const onPointerMove = (ev: MouseEvent) => {
      updateTimeFromEvent(ev);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [totalDuration, zoom, snapping, project.sequence.inPoint, project.sequence.outPoint, seek]);

  // In / Out range bar
  const inPx = (project.sequence.inPoint ?? 0) * zoom;
  const outPx = (project.sequence.outPoint ?? totalDuration) * zoom;
  const workAreaWidth = Math.max(0, outPx - inPx);

  return (
    <div className="h-7 bg-[#1c1c1c] border-b border-[#2d2d2d] flex items-center relative select-none">
      {/* Track Header Spacer */}
      <div 
        style={{ width: `${headerWidth}px` }} 
        className="h-full bg-[#1c1c1c] border-r border-[#2d2d2d] flex items-center px-3 text-[10px] font-semibold text-[#777] uppercase tracking-wider shrink-0"
      >
        Timeline
      </div>

      {/* Interactive Ruler Canvas / Area */}
      <div 
        ref={rulerRef}
        onPointerDown={handlePointerDown}
        style={{ width: `${totalWidth}px` }}
        className="h-full relative cursor-ew-resize overflow-hidden"
      >
        {/* Premiere Pro In/Out Work Area Bar */}
        <div 
          style={{
            left: `${inPx}px`,
            width: `${workAreaWidth}px`,
          }}
          className="absolute top-0 bottom-0 bg-[#1473e6]/10 border-x border-[#1473e6]/40 pointer-events-none"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1473e6]/70"></div>
        </div>

        {/* Major & Minor Ticks */}
        {Array.from({ length: numTicks + 1 }).map((_, i) => {
          const tickTime = i * tickInterval;
          const pos = tickTime * zoom;
          const isMajor = tickTime % (tickInterval * 2) === 0;

          return (
            <div
              key={i}
              style={{ left: `${pos}px` }}
              className="absolute bottom-0 flex flex-col items-center pointer-events-none"
            >
              <div 
                className={`w-[1px] ${isMajor ? 'h-3 bg-[#666]' : 'h-1.5 bg-[#444]'}`} 
              />
              {isMajor && (
                <span className="text-[9px] font-mono text-[#888] absolute -top-4 -left-3 tracking-tighter">
                  {secondsToTimecode(tickTime, project.sequence.fps).slice(3)}
                </span>
              )}
            </div>
          );
        })}

        {/* Premiere Pro Signature Blue Playhead Head */}
        <div
          style={{ left: `${currentTime * zoom}px` }}
          className="absolute top-0 -ml-2.5 z-30 pointer-events-none flex flex-col items-center"
        >
          {/* Playhead Shape */}
          <div className="w-5 h-4 bg-[#388bfd] shadow-md flex items-center justify-center rounded-t-sm clip-playhead">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
          <div className="w-[1.5px] h-3 bg-[#388bfd]" />
        </div>
      </div>
    </div>
  );
};
