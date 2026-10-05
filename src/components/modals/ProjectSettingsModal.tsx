import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Settings, X } from 'lucide-react';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose }) => {
  const { project, setSequence } = useProject();

  const [name, setName] = useState(project.sequence.name);
  const [width, setWidth] = useState(project.sequence.width);
  const [height, setHeight] = useState(project.sequence.height);
  const [fps, setFps] = useState(project.sequence.fps);
  const [duration, setDuration] = useState(project.sequence.duration);

  if (!isOpen) return null;

  const handleSave = () => {
    setSequence({
      name,
      width: Number(width),
      height: Number(height),
      fps: Number(fps),
      duration: Number(duration),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1c1c1c] border border-[#333] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="h-10 bg-[#252525] border-b border-[#333] flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[#1473E6]" />
            <span className="font-bold text-white text-sm">Sequence Settings</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 bg-[#181818]">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Sequence Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white outline-none focus:border-[#1473E6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Frame Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Frame Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Timebase (FPS)</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white outline-none"
              >
                <option value="24">24.00 fps (Cinema)</option>
                <option value="30">30.00 fps (Standard)</option>
                <option value="60">60.00 fps (Smooth)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Duration (Seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-11 bg-[#222] border-t border-[#333] px-4 flex items-center justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 rounded hover:bg-[#303030] text-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-1 rounded bg-[#1473E6] hover:bg-[#388BFD] text-white font-semibold">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
