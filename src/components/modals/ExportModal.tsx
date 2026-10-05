import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { exporter, ExportOptions } from '../../engine/Exporter';
import { Download, X, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { secondsToTimecode } from '../../utils/timecode';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project } = useProject();

  const [preset, setPreset] = useState<'1080p' | '4k' | 'reels' | '720p'>('1080p');
  const [fileName, setFileName] = useState(`${project.name.replace(/\s+/g, '_')}_Render`);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [range, setRange] = useState<'entire' | 'inOut'>('entire');

  // Export progress states
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = {
    '1080p': { label: 'YouTube 1080p Full HD (1920x1080)', width: 1920, height: 1080, fps: 30, bitrate: 14_000_000 },
    '4k': { label: 'YouTube 4K Ultra HD (3840x2160)', width: 3840, height: 2160, fps: 30, bitrate: 30_000_000 },
    'reels': { label: 'Social Reels / TikTok 9:16 (1080x1920)', width: 1080, height: 1920, fps: 30, bitrate: 12_000_000 },
    '720p': { label: 'Web Fast Draft 720p (1280x720)', width: 1280, height: 720, fps: 30, bitrate: 6_000_000 },
  };

  const selectedPreset = presets[preset];

  // Calculate estimated file size
  const exportSecs = range === 'inOut' && project.sequence.outPoint 
    ? Math.max(1, (project.sequence.outPoint - (project.sequence.inPoint || 0)))
    : project.sequence.duration;

  const estMegabytes = ((selectedPreset.bitrate * exportSecs) / (8 * 1024 * 1024)).toFixed(1);

  const startExport = async () => {
    setIsExporting(true);
    setIsComplete(false);
    setErrorMsg(null);
    setProgress(0);

    const exportOpts: ExportOptions = {
      fileName,
      width: selectedPreset.width,
      height: selectedPreset.height,
      fps: selectedPreset.fps,
      bitrate: selectedPreset.bitrate,
      format,
    };

    try {
      const blob = await exporter.exportSequence(
        range === 'entire' 
          ? { ...project.sequence, inPoint: 0, outPoint: project.sequence.duration }
          : project.sequence,
        project.tracks,
        project.clips,
        project.mediaPool,
        exportOpts,
        (pct, cur, tot) => {
          setProgress(pct);
          setCurrentTime(cur);
          setTotalDuration(tot);
        }
      );

      // Download file automatically
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${fileName}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setIsExporting(false);
      setIsComplete(true);
    } catch (err: any) {
      setIsExporting(false);
      setErrorMsg(err?.message || 'Export error occurred');
    }
  };

  const cancelExport = () => {
    exporter.cancel();
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1c1c1c] border border-[#333] rounded-lg shadow-2xl w-full max-w-xl overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="h-10 bg-[#252525] border-b border-[#333] flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-[#1473E6]" />
            <span className="font-bold text-white text-sm">Export Sequence (Premiere Pro 2025 Engine)</span>
          </div>
          {!isExporting && (
            <button onClick={onClose} className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-[#181818]">
          {isExporting ? (
            /* Active Export Progress Screen */
            <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-[#1473E6] border-t-transparent animate-spin flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#1473E6] animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">Rendering Sequence...</span>
                <div className="text-gray-400 text-xs mt-1">
                  Encoding {selectedPreset.width}x{selectedPreset.height} @ {selectedPreset.fps}fps
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md bg-[#121212] h-3 rounded-full overflow-hidden border border-[#333] p-0.5">
                <div 
                  style={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-[#1473E6] to-[#00e5ff] h-full rounded-full transition-all duration-150"
                />
              </div>

              <div className="flex items-center justify-between w-full max-w-md text-xs text-gray-400 font-mono">
                <span>{progress}% Completed</span>
                <span>{secondsToTimecode(currentTime, 30)} / {secondsToTimecode(totalDuration, 30)}</span>
              </div>

              <button
                onClick={cancelExport}
                className="px-4 py-1.5 rounded bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-medium transition-colors"
              >
                Cancel Export
              </button>
            </div>
          ) : isComplete ? (
            /* Export Complete Screen */
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#10b981]" />
              <span className="font-bold text-white text-base">Export Successfully Rendered!</span>
              <p className="text-gray-400 text-xs max-w-md">
                Your video has been encoded and downloaded as <strong className="text-white">{fileName}.{format}</strong>.
              </p>
              <button
                onClick={() => { setIsComplete(false); onClose(); }}
                className="mt-2 px-6 py-2 rounded bg-[#1473E6] hover:bg-[#388BFD] text-white font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* Configure Settings Form */
            <>
              {errorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-800 rounded flex items-center space-x-2 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* File Name */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white outline-none focus:border-[#1473E6]"
                />
              </div>

              {/* Preset Selector */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Export Preset</label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as any)}
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white outline-none"
                >
                  {Object.entries(presets).map(([k, p]) => (
                    <option key={k} value={k}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Format & Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'webm' | 'mp4')}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white outline-none uppercase"
                  >
                    <option value="webm">WebM (VP9 + Opus) [Recommended]</option>
                    <option value="mp4">MP4 (H.264 / AAC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Range</label>
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as 'entire' | 'inOut')}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white outline-none"
                  >
                    <option value="entire">Entire Sequence ({project.sequence.duration}s)</option>
                    <option value="inOut">In/Out Work Area</option>
                  </select>
                </div>
              </div>

              {/* Estimated Info Banner */}
              <div className="p-3 bg-[#141414] border border-[#2a2a2a] rounded flex items-center justify-between text-gray-400 text-xs">
                <div>
                  <span>Target Resolution: </span>
                  <strong className="text-white">{selectedPreset.width}x{selectedPreset.height}</strong>
                </div>
                <div>
                  <span>Est. File Size: </span>
                  <strong className="text-[#00e5ff]">~{estMegabytes} MB</strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isExporting && !isComplete && (
          <div className="h-12 bg-[#222] border-t border-[#333] px-4 flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded hover:bg-[#303030] text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={startExport}
              className="flex items-center space-x-1.5 bg-[#1473E6] hover:bg-[#388BFD] text-white px-5 py-1.5 rounded font-semibold transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
