import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = [
    {
      title: 'Playback & Transport',
      shortcuts: [
        { key: 'Space', desc: 'Play / Pause sequence toggle' },
        { key: 'J / K / L', desc: 'Shuttle Reverse / Pause / Fast Forward' },
        { key: 'Left / Right', desc: 'Step backward / forward 1 frame' },
        { key: 'Shift + Left / Right', desc: 'Step backward / forward 5 frames' },
        { key: 'Home / End', desc: 'Jump to start / end of timeline' },
        { key: 'I / O', desc: 'Mark In point / Mark Out point' },
      ],
    },
    {
      title: 'Tools & Editing',
      shortcuts: [
        { key: 'V', desc: 'Selection Tool' },
        { key: 'C', desc: 'Razor Tool (Click to cut clip)' },
        { key: 'Ctrl + K', desc: 'Razor split all tracks at playhead' },
        { key: 'B', desc: 'Ripple Edit Tool' },
        { key: 'A', desc: 'Track Select Forward Tool' },
        { key: 'T', desc: 'Type Tool (New title graphic)' },
        { key: 'Delete / Backspace', desc: 'Delete selected clip' },
        { key: 'S', desc: 'Toggle Magnetic Snapping' },
      ],
    },
    {
      title: 'Project & Workspace',
      shortcuts: [
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Y', desc: 'Redo' },
        { key: 'Ctrl + M', desc: 'Export Sequence dialog' },
        { key: '+ / -', desc: 'Zoom in / zoom out timeline' },
        { key: '\\', desc: 'Fit entire sequence into timeline' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1c1c1c] border border-[#333] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="h-10 bg-[#252525] border-b border-[#333] flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-[#1473E6]" />
            <span className="font-bold text-white text-sm">Adobe Premiere Pro 2025 Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#181818] max-h-[75vh] overflow-y-auto custom-scrollbar">
          {categories.map(cat => (
            <div key={cat.title} className="bg-[#141414] border border-[#2a2a2a] rounded p-3 space-y-2">
              <span className="font-bold text-[#388BFD] uppercase tracking-wider text-[10px] block">
                {cat.title}
              </span>
              <div className="space-y-1.5">
                {cat.shortcuts.map(sc => (
                  <div key={sc.key} className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">{sc.desc}</span>
                    <kbd className="bg-[#242424] text-white px-2 py-0.5 rounded font-mono text-[10px] border border-[#383838] shadow-sm shrink-0 ml-2">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-10 bg-[#222] border-t border-[#333] px-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-[#1473E6] hover:bg-[#388BFD] text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
