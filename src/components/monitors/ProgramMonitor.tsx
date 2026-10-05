import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useProject } from '../../context/ProjectContext';
import { usePlayback } from '../../context/PlaybackContext';
import { Compositor } from '../../engine/Compositor';
import { secondsToTimecode } from '../../utils/timecode';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Camera, 
  Maximize2, 
  Grid, 
  RotateCcw,
  Square,
  Repeat
} from 'lucide-react';

export const ProgramMonitor: React.FC = () => {
  const { 
    project, 
    selectedClipId, 
    showSafeMargins, 
    setShowSafeMargins,
    setSequence,
  } = useProject();

  const { 
    currentTime, 
    isPlaying, 
    togglePlay, 
    stepFrames, 
    seek, 
  } = usePlayback();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositorRef = useRef<Compositor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState<'fit' | '50' | '100'>('fit');
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Initialize compositor
  useEffect(() => {
    if (canvasRef.current && !compositorRef.current) {
      compositorRef.current = new Compositor(canvasRef.current);
    }
  }, []);

  // Register media items when media pool updates
  useEffect(() => {
    if (compositorRef.current) {
      project.mediaPool.forEach(item => compositorRef.current?.registerMedia(item));
    }
  }, [project.mediaPool]);

  // Render on every frame / playback tick / state change
  useEffect(() => {
    if (!compositorRef.current || !canvasRef.current) return;

    compositorRef.current.renderSequence(
      currentTime,
      project.sequence,
      project.tracks,
      project.clips,
      project.mediaPool,
      selectedClipId,
      isPlaying,
      showSafeMargins
    );

    // Looping logic
    if (isPlaying && project.sequence.outPoint !== null && currentTime >= project.sequence.outPoint) {
      if (isLooping) {
        seek(project.sequence.inPoint || 0);
      }
    }
  }, [
    currentTime,
    project.sequence,
    project.tracks,
    project.clips,
    project.mediaPool,
    selectedClipId,
    isPlaying,
    showSafeMargins,
    isLooping,
    seek,
  ]);

  // Snapshot Current Frame (Camera icon)
  const takeSnapshot = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Snapshot_${secondsToTimecode(currentTime, project.sequence.fps).replace(/:/g, '-')}.png`;
    a.click();
  }, [currentTime, project.sequence.fps]);

  // Mark In & Mark Out
  const markInPoint = () => {
    setSequence({ inPoint: currentTime });
  };

  const markOutPoint = () => {
    setSequence({ outPoint: currentTime });
  };

  const goToInPoint = () => {
    if (project.sequence.inPoint !== null) seek(project.sequence.inPoint);
  };

  const goToOutPoint = () => {
    if (project.sequence.outPoint !== null) seek(project.sequence.outPoint);
  };

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none">
      {/* Panel Tab Header */}
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white tracking-wide">Program:</span>
          <span className="text-[#388BFD] font-medium">{project.sequence.name}</span>
        </div>

        {/* View Controls: Zoom, Safe Margins, Camera */}
        <div className="flex items-center space-x-2 text-[#aaa]">
          {/* Aspect Ratio Presets */}
          <select
            value={`${project.sequence.width}x${project.sequence.height}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(Number);
              setSequence({ width: w, height: h });
            }}
            className="bg-[#2a2a2a] text-[#ddd] text-[11px] px-1.5 py-0.5 rounded border border-[#3a3a3a] outline-none"
            title="Sequence Aspect Ratio Preset"
          >
            <option value="1920x1080">16:9 (1080p)</option>
            <option value="1080x1920">9:16 (Reels/Shorts)</option>
            <option value="1080x1080">1:1 (Square)</option>
            <option value="3840x2160">16:9 (4K UHD)</option>
          </select>

          <select
            value={zoomLevel}
            onChange={(e) => setZoomLevel(e.target.value as 'fit' | '50' | '100')}
            className="bg-[#2a2a2a] text-[#ddd] text-[11px] px-1.5 py-0.5 rounded border border-[#3a3a3a] outline-none"
          >
            <option value="fit">Fit</option>
            <option value="50">50%</option>
            <option value="100">100%</option>
          </select>

          <button
            onClick={() => setShowSafeMargins(prev => !prev)}
            title="Toggle Safe Margins"
            className={`p-1 rounded hover:bg-[#333] hover:text-white transition-colors ${showSafeMargins ? 'text-[#388BFD] bg-[#2a2a2a]' : ''}`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={takeSnapshot}
            title="Export Frame Snapshot (PNG)"
            className="p-1 rounded hover:bg-[#333] hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#101010] relative flex items-center justify-center overflow-hidden p-2"
      >
        <div 
          className="relative shadow-2xl transition-all"
          style={{
            maxWidth: zoomLevel === 'fit' ? '100%' : zoomLevel === '50' ? '50%' : '100%',
            maxHeight: '100%',
            aspectRatio: `${project.sequence.width} / ${project.sequence.height}`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={project.sequence.width}
            height={project.sequence.height}
            onPointerDown={(e) => {
              if (!selectedClipId || !canvasRef.current) return;
              const clip = project.clips.find(c => c.id === selectedClipId);
              if (!clip) return;

              const canvas = canvasRef.current;
              const rect = canvas.getBoundingClientRect();
              const scaleRatioX = project.sequence.width / rect.width;
              const scaleRatioY = project.sequence.height / rect.height;

              const startX = e.clientX;
              const startY = e.clientY;
              const initialPosX = clip.transform.positionX;
              const initialPosY = clip.transform.positionY;

              const onPointerMove = (ev: MouseEvent) => {
                const deltaX = (ev.clientX - startX) * scaleRatioX;
                const deltaY = (ev.clientY - startY) * scaleRatioY;
                const updatedClips = project.clips.map(c => 
                  c.id === selectedClipId
                    ? { ...c, transform: { ...c.transform, positionX: initialPosX + deltaX, positionY: initialPosY + deltaY } }
                    : c
                );
                // Directly mutate active clip transform
                const sel = updatedClips.find(c => c.id === selectedClipId);
                if (sel) {
                  clip.transform.positionX = initialPosX + deltaX;
                  clip.transform.positionY = initialPosY + deltaY;
                }
              };

              const onPointerUp = () => {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
              };

              window.addEventListener('pointermove', onPointerMove);
              window.addEventListener('pointerup', onPointerUp);
            }}
            className={`w-full h-full object-contain bg-black rounded shadow-md ${
              selectedClipId ? 'cursor-move' : 'cursor-default'
            }`}
          />
        </div>
      </div>

      {/* Transport Controls & Timecode Footer */}
      <div className="h-11 bg-[#1e1e1e] border-t border-[#2a2a2a] flex items-center justify-between px-3 text-xs">
        {/* Current Timecode Display */}
        <div className="flex items-center space-x-2">
          <span 
            className="font-mono text-[#00e5ff] bg-[#141414] px-2.5 py-1 rounded border border-[#2e2e2e] text-xs font-bold tracking-wider cursor-pointer hover:border-[#388BFD]"
            title="Current Sequence Timecode (SMPTE)"
          >
            {secondsToTimecode(currentTime, project.sequence.fps)}
          </span>
        </div>

        {/* Center Transport Buttons */}
        <div className="flex items-center space-x-1.5 text-[#ddd]">
          {/* Mark In */}
          <button 
            onClick={markInPoint} 
            title="Mark In (I)"
            className="px-1.5 py-1 rounded hover:bg-[#303030] hover:text-white text-[11px] font-bold"
          >
            {'{'}
          </button>

          {/* Go to In */}
          <button 
            onClick={goToInPoint} 
            title="Go to In Point (Shift+I)"
            className="p-1.5 rounded hover:bg-[#303030] hover:text-white"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Step 1 frame back */}
          <button 
            onClick={() => stepFrames(-1)} 
            title="Step Back 1 Frame (Left Arrow)"
            className="px-2 py-1 rounded hover:bg-[#303030] hover:text-white text-[11px] font-semibold"
          >
            -1f
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            className="w-8 h-8 rounded-full bg-[#1473E6] hover:bg-[#388BFD] text-white flex items-center justify-center shadow transition-transform active:scale-95 mx-1"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          {/* Step 1 frame forward */}
          <button 
            onClick={() => stepFrames(1)} 
            title="Step Forward 1 Frame (Right Arrow)"
            className="px-2 py-1 rounded hover:bg-[#303030] hover:text-white text-[11px] font-semibold"
          >
            +1f
          </button>

          {/* Go to Out */}
          <button 
            onClick={goToOutPoint} 
            title="Go to Out Point (Shift+O)"
            className="p-1.5 rounded hover:bg-[#303030] hover:text-white"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Mark Out */}
          <button 
            onClick={markOutPoint} 
            title="Mark Out (O)"
            className="px-1.5 py-1 rounded hover:bg-[#303030] hover:text-white text-[11px] font-bold"
          >
            {'}'}
          </button>

          {/* Loop playback toggle */}
          <button
            onClick={() => setIsLooping(l => !l)}
            title="Toggle Loop Playback"
            className={`p-1.5 rounded hover:bg-[#303030] ml-2 ${isLooping ? 'text-[#388BFD] bg-[#2a2a2a]' : 'text-[#888]'}`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Sequence Duration Timecode */}
        <div className="flex items-center space-x-2 text-[#888] font-mono text-[11px]">
          <span>/</span>
          <span>{secondsToTimecode(project.sequence.duration, project.sequence.fps)}</span>
        </div>
      </div>
    </div>
  );
};
