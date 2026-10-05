import React, { useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { usePlayback } from '../../context/PlaybackContext';
import { TimeRuler } from './TimeRuler';
import { TrackHeader } from './TrackHeader';
import { TimelineClip } from './TimelineClip';
import { 
  Magnet, 
  ZoomIn, 
  ZoomOut, 
  Scissors, 
  Trash2, 
  Plus, 
  Maximize2 
} from 'lucide-react';

export const Timeline: React.FC = () => {
  const {
    project,
    timelineZoom,
    setTimelineZoom,
    snapping,
    setSnapping,
    selectedClipId,
    deleteClip,
    splitAllClipsAt,
    setSelectedClipId,
  } = useProject();

  const { currentTime, seek } = usePlayback();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const headerWidth = 130;
  const totalDuration = project.sequence.duration;
  const timelineContentWidth = Math.max(1200, totalDuration * timelineZoom);

  // Group tracks into Video and Audio
  const videoTracks = project.tracks
    .filter(t => t.type === 'video')
    .sort((a, b) => b.index - a.index); // Top track (V3) on top, V1 on bottom

  const audioTracks = project.tracks
    .filter(t => t.type === 'audio')
    .sort((a, b) => a.index - b.index);

  const handleZoomChange = (delta: number) => {
    setTimelineZoom((prev: number) => Math.max(12, Math.min(180, prev + delta)));
  };

  const handleFitTimeline = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth - headerWidth;
      const fitZoom = Math.max(12, Math.floor(containerWidth / totalDuration));
      setTimelineZoom(fitZoom);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none">
      {/* Top Ruler Bar */}
      <TimeRuler 
        totalDuration={totalDuration} 
        zoom={timelineZoom} 
        headerWidth={headerWidth} 
      />

      {/* Main Track Lanes & Headers Scroll View */}
      <div 
        ref={scrollContainerRef}
        onClick={() => setSelectedClipId(null)}
        className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#141414] custom-scrollbar"
      >
        <div 
          style={{ width: `${headerWidth + timelineContentWidth}px` }}
          className="relative min-h-full"
        >
          {/* Vertical Playhead Cursor Line (Spans across all tracks) */}
          <div
            style={{ left: `${headerWidth + currentTime * timelineZoom}px` }}
            className="absolute top-0 bottom-0 w-[1.5px] bg-[#388bfd] pointer-events-none z-30 shadow-sm"
          />

          {/* Video Tracks Stack */}
          {videoTracks.map(track => {
            const trackClips = project.clips.filter(c => c.trackId === track.id);
            return (
              <div key={track.id} className="flex relative">
                {/* Track Left Header */}
                <TrackHeader track={track} width={headerWidth} />

                {/* Track Right Lane */}
                <div
                  style={{
                    width: `${timelineContentWidth}px`,
                    height: `${track.height}px`,
                  }}
                  className="relative border-b border-[#222] bg-[#161c22]/50 hover:bg-[#1a232b]/40 transition-colors"
                >
                  {trackClips.map(clip => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      zoom={timelineZoom}
                      trackHeight={track.height}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Video / Audio Track Dividing Line */}
          <div className="h-1.5 bg-[#101010] border-y border-[#2a2a2a] w-full" />

          {/* Audio Tracks Stack */}
          {audioTracks.map(track => {
            const trackClips = project.clips.filter(c => c.trackId === track.id);
            return (
              <div key={track.id} className="flex relative">
                <TrackHeader track={track} width={headerWidth} />
                <div
                  style={{
                    width: `${timelineContentWidth}px`,
                    height: `${track.height}px`,
                  }}
                  className="relative border-b border-[#222] bg-[#14231d]/50 hover:bg-[#182b24]/40 transition-colors"
                >
                  {trackClips.map(clip => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      zoom={timelineZoom}
                      trackHeight={track.height}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Timeline Controls Bar */}
      <div className="h-8 bg-[#1e1e1e] border-t border-[#2a2a2a] flex items-center justify-between px-3 text-xs z-20">
        {/* Left: Snap & Split Tools */}
        <div className="flex items-center space-x-2 text-[#aaa]">
          {/* Snapping Toggle */}
          <button
            onClick={() => setSnapping((s: boolean) => !s)}
            title="Toggle Snapping (S)"
            className={`p-1 rounded hover:bg-[#2c2c2c] transition-colors ${
              snapping ? 'text-[#388BFD] bg-[#282828]' : 'text-[#666]'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {/* Split All at Playhead (Razor All) */}
          <button
            onClick={() => splitAllClipsAt(currentTime)}
            title="Split All at Playhead (Ctrl+K)"
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-[#2c2c2c] text-[#bbb] hover:text-white"
          >
            <Scissors className="w-3 h-3 text-[#388BFD]" />
            <span className="text-[10px]">Cut at Playhead</span>
          </button>

          {/* Delete Selected Clip */}
          {selectedClipId && (
            <button
              onClick={() => deleteClip(selectedClipId)}
              title="Delete Selected Clip (Del)"
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/60"
            >
              <Trash2 className="w-3 h-3" />
              <span className="text-[10px]">Delete</span>
            </button>
          )}
        </div>

        {/* Right: Timeline Zooming Controls */}
        <div className="flex items-center space-x-2 text-[#aaa]">
          <button
            onClick={() => handleZoomChange(-8)}
            title="Zoom Out (-)"
            className="p-1 rounded hover:bg-[#2c2c2c] hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="12"
            max="160"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(Number(e.target.value))}
            className="w-24 accent-[#1473E6] h-1 bg-[#333] rounded cursor-pointer"
          />

          <button
            onClick={() => handleZoomChange(8)}
            title="Zoom In (+)"
            className="p-1 rounded hover:bg-[#2c2c2c] hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFitTimeline}
            title="Fit Entire Sequence (\)"
            className="p-1 rounded hover:bg-[#2c2c2c] hover:text-white ml-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
