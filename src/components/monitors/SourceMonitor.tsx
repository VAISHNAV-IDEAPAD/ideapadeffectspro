import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { usePlayback } from '../../context/PlaybackContext';
import { secondsToTimecode } from '../../utils/timecode';
import { Play, Pause, ArrowDownToLine, PlusSquare, FileVideo, Music, Image as ImageIcon } from 'lucide-react';

export const SourceMonitor: React.FC = () => {
  const { project, addClipFromMedia } = useProject();
  const { currentTime } = usePlayback();

  const [selectedMediaId, setSelectedMediaId] = useState<string>(project.mediaPool[0]?.id || '');
  const [sourceTime, setSourceTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sourceIn, setSourceIn] = useState<number>(0);
  const [sourceOut, setSourceOut] = useState<number>(5);

  const activeMedia = project.mediaPool.find(m => m.id === selectedMediaId);

  // Insert clip onto active target track at sequence playhead
  const handleInsert = () => {
    if (!activeMedia) return;
    const targetVideoTrack = project.tracks.find(t => t.type === 'video' && t.target)?.id || 'v1';
    addClipFromMedia(activeMedia.id, targetVideoTrack, currentTime);
  };

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      {/* Header with Media Selector */}
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">Source:</span>
          <select
            value={selectedMediaId}
            onChange={(e) => {
              setSelectedMediaId(e.target.value);
              setSourceTime(0);
            }}
            className="bg-[#2a2a2a] text-[#ddd] text-[11px] px-2 py-0.5 rounded border border-[#3a3a3a] outline-none max-w-[200px] truncate"
          >
            {project.mediaPool.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="text-[11px] font-mono text-gray-400">
          {activeMedia ? secondsToTimecode(activeMedia.duration, 30) : '00:00:00:00'}
        </div>
      </div>

      {/* Preview Screen */}
      <div className="flex-1 bg-[#101010] relative flex items-center justify-center p-3">
        {activeMedia ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-[#262626] rounded bg-black/40 relative overflow-hidden">
            {activeMedia.type === 'video' && (
              <div className="flex flex-col items-center text-center p-4">
                <FileVideo className="w-16 h-16 text-[#388BFD] mb-3 opacity-80" />
                <span className="font-semibold text-white text-sm">{activeMedia.name}</span>
                <span className="text-[11px] text-gray-400 mt-1">1920x1080 @ 30fps | {activeMedia.fileSize || 'Sample Video'}</span>
              </div>
            )}
            {activeMedia.type === 'audio' && (
              <div className="flex flex-col items-center text-center p-4">
                <Music className="w-16 h-16 text-[#10b981] mb-3 opacity-80" />
                <span className="font-semibold text-white text-sm">{activeMedia.name}</span>
                <span className="text-[11px] text-gray-400 mt-1">Stereo 48kHz WAV | {activeMedia.fileSize || 'Audio Track'}</span>
              </div>
            )}
            {activeMedia.type === 'title' && (
              <div className="flex flex-col items-center text-center p-4">
                <span className="font-extrabold text-2xl text-white tracking-wider bg-[#1473E6] px-6 py-2 rounded shadow">
                  SAMPLE TITLE
                </span>
                <span className="text-[11px] text-gray-400 mt-3">{activeMedia.name}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-500">No media selected in Project Bin</span>
        )}
      </div>

      {/* Source Controls */}
      <div className="h-10 bg-[#1e1e1e] border-t border-[#2a2a2a] flex items-center justify-between px-3">
        <span className="font-mono text-[#00e5ff] text-[11px]">
          {secondsToTimecode(sourceTime, 30)}
        </span>

        <div className="flex items-center space-x-2">
          {/* Insert into Sequence (Comma key in Premiere) */}
          <button
            onClick={handleInsert}
            title="Insert into Sequence (Comma ,)"
            className="flex items-center space-x-1 bg-[#2a2a2a] hover:bg-[#1473E6] text-[#ddd] hover:text-white px-2.5 py-1 rounded transition-colors text-[11px]"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Insert (,)</span>
          </button>

          {/* Overwrite into Sequence (Period key in Premiere) */}
          <button
            onClick={handleInsert}
            title="Overwrite into Sequence (Period .)"
            className="flex items-center space-x-1 bg-[#2a2a2a] hover:bg-[#1473E6] text-[#ddd] hover:text-white px-2.5 py-1 rounded transition-colors text-[11px]"
          >
            <PlusSquare className="w-3.5 h-3.5" />
            <span>Overwrite (.)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
