import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { TransitionType } from '../../types/project';
import { Sliders, Sparkles, Wand2, Search, ChevronRight, ChevronDown } from 'lucide-react';

export const EffectsLibrary: React.FC = () => {
  const { project, selectedClipId, updateClip } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    transitions: true,
    videoFX: true,
  });

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const applyTransition = (type: TransitionType) => {
    if (!selectedClipId) return;
    updateClip(selectedClipId, {
      transitionIn: { type, duration: 0.8 },
      transitionOut: { type, duration: 0.8 },
    });
  };

  const transitions: { id: TransitionType; label: string; desc: string }[] = [
    { id: 'cross_dissolve', label: 'Cross Dissolve', desc: 'Standard smooth opacity blend' },
    { id: 'dip_to_black', label: 'Dip to Black', desc: 'Fades down to pure black, then back' },
    { id: 'dip_to_white', label: 'Dip to White', desc: 'Flash transition to white' },
    { id: 'slide_up', label: 'Slide Up', desc: 'Upward motion push' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-3.5 h-3.5 text-[#388BFD]" />
          <span className="font-semibold text-white">Effects & Transitions</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[#262626] bg-[#1a1a1a]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search Effects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121212] border border-[#333] rounded pl-7 pr-2 py-1 text-xs text-[#ddd] placeholder-gray-600 outline-none focus:border-[#1473E6]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#141414] custom-scrollbar">
        {/* Video Transitions Category */}
        <div className="border border-[#282828] rounded overflow-hidden">
          <button
            onClick={() => toggleSection('transitions')}
            className="w-full bg-[#1d1d1d] hover:bg-[#242424] px-2.5 py-1.5 flex items-center justify-between text-white font-medium"
          >
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Video Transitions</span>
            </div>
            {openSections.transitions ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          {openSections.transitions && (
            <div className="p-1 space-y-1 bg-[#161616]">
              {transitions.map(t => (
                <div
                  key={t.id}
                  onClick={() => applyTransition(t.id)}
                  className="px-2 py-1.5 rounded hover:bg-[#252525] border border-transparent hover:border-[#1473E6] cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium text-white group-hover:text-[#388BFD]">{t.label}</div>
                    <div className="text-[10px] text-gray-500">{t.desc}</div>
                  </div>
                  <button className="text-[10px] text-gray-400 group-hover:text-white bg-[#2a2a2a] group-hover:bg-[#1473E6] px-2 py-0.5 rounded transition-colors">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Effects Category */}
        <div className="border border-[#282828] rounded overflow-hidden">
          <button
            onClick={() => toggleSection('videoFX')}
            className="w-full bg-[#1d1d1d] hover:bg-[#242424] px-2.5 py-1.5 flex items-center justify-between text-white font-medium"
          >
            <div className="flex items-center space-x-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Video Filters & FX</span>
            </div>
            {openSections.videoFX ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          {openSections.videoFX && (
            <div className="p-2 text-gray-400 text-[11px] bg-[#161616] space-y-1.5">
              <p>Lumetri color grading effects, vignette, and real-time blend modes are integrated directly into the Lumetri and Effect Controls panels for instantaneous hardware-accelerated preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
