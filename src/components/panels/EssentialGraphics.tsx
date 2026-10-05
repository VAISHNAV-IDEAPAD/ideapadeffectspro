import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { TitleAnimationPreset } from '../../types/project';
import { Type, AlignLeft, AlignCenter, AlignRight, Sparkles, Layers } from 'lucide-react';

export const EssentialGraphics: React.FC = () => {
  const { project, selectedClipId, updateClip } = useProject();

  const selectedClip = project.clips.find(c => c.id === selectedClipId);

  if (!selectedClip || selectedClip.type !== 'title' || !selectedClip.textConfig) {
    return (
      <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs items-center justify-center p-6 text-gray-500 text-center">
        <Type className="w-10 h-10 mb-2 opacity-30 text-pink-400" />
        <span className="font-medium text-[#aaa]">No Title Clip Selected</span>
        <span className="text-[11px] mt-1 text-gray-500">Select a Title graphic clip on the timeline or click 'Title' in the Project Bin to design titles.</span>
      </div>
    );
  }

  const { textConfig } = selectedClip;

  const updateText = (key: keyof typeof textConfig, val: any) => {
    updateClip(selectedClip.id, {
      textConfig: {
        ...textConfig,
        [key]: val,
      },
    });
  };

  const fonts = [
    'Montserrat',
    'Inter',
    'Bebas Neue',
    'Oswald',
    'Roboto',
    'Playfair Display',
  ];

  const animations: { id: TitleAnimationPreset; label: string }[] = [
    { id: 'none', label: 'None (Static)' },
    { id: 'fadeIn', label: 'Cinematic Fade In' },
    { id: 'typewriter', label: 'Retro Typewriter' },
    { id: 'slideUp', label: 'Smooth Slide Up' },
    { id: 'lowerThird', label: 'Broadcast Lower Third' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Type className="w-3.5 h-3.5 text-pink-400" />
          <span className="font-semibold text-white">Essential Graphics:</span>
          <span className="text-[#388BFD] font-medium truncate">{selectedClip.name}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar bg-[#141414]">
        {/* TEXT CONTENT */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2">
          <span className="font-bold text-[#ccc] text-[10px] uppercase tracking-wider block">Text Content</span>
          <textarea
            rows={2}
            value={textConfig.text}
            onChange={(e) => updateText('text', e.target.value)}
            className="w-full bg-[#121212] border border-[#333] rounded p-2 text-xs text-white font-medium outline-none focus:border-[#1473E6] resize-none"
          />
        </div>

        {/* TYPOGRAPHY */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2.5">
          <span className="font-bold text-[#ccc] text-[10px] uppercase tracking-wider block">Typography</span>

          {/* Font Family */}
          <div>
            <div className="text-[10px] text-gray-400 mb-0.5">Font Family</div>
            <select
              value={textConfig.fontFamily}
              onChange={(e) => updateText('fontFamily', e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none"
            >
              {fonts.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Font Size & Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>Size</span>
                <span className="text-[#00e5ff] font-mono">{textConfig.fontSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="140"
                value={textConfig.fontSize}
                onChange={(e) => updateText('fontSize', Number(e.target.value))}
                className="w-full accent-pink-500 h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">Weight</div>
              <select
                value={textConfig.fontWeight}
                onChange={(e) => updateText('fontWeight', e.target.value)}
                className="w-full bg-[#121212] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none"
              >
                <option value="400">Regular (400)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center space-x-1 border border-[#333] rounded p-0.5 bg-[#121212] w-fit">
            <button
              onClick={() => updateText('alignment', 'left')}
              className={`p-1 rounded ${textConfig.alignment === 'left' ? 'bg-[#1473E6] text-white' : 'text-gray-400'}`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateText('alignment', 'center')}
              className={`p-1 rounded ${textConfig.alignment === 'center' ? 'bg-[#1473E6] text-white' : 'text-gray-400'}`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateText('alignment', 'right')}
              className={`p-1 rounded ${textConfig.alignment === 'right' ? 'bg-[#1473E6] text-white' : 'text-gray-400'}`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* APPEARANCE: FILL & STROKE & BACKGROUND */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2.5">
          <span className="font-bold text-[#ccc] text-[10px] uppercase tracking-wider block">Appearance</span>

          {/* Text Fill Color */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Fill Color</span>
            <input
              type="color"
              value={textConfig.color}
              onChange={(e) => updateText('color', e.target.value)}
              className="w-6 h-6 rounded border border-[#444] cursor-pointer bg-transparent"
            />
          </div>

          {/* Background Banner */}
          <div className="border-t border-[#262626] pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={textConfig.hasBackground}
                  onChange={(e) => updateText('hasBackground', e.target.checked)}
                  className="rounded accent-[#1473E6]"
                />
                <span>Background Box</span>
              </label>
              {textConfig.hasBackground && (
                <input
                  type="color"
                  value={textConfig.backgroundColor}
                  onChange={(e) => updateText('backgroundColor', e.target.value)}
                  className="w-5 h-5 rounded border border-[#444] cursor-pointer bg-transparent"
                />
              )}
            </div>
            {textConfig.hasBackground && (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-400">Opacity</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={textConfig.backgroundOpacity}
                  onChange={(e) => updateText('backgroundOpacity', Number(e.target.value))}
                  className="flex-1 accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
                />
                <span className="text-[10px] font-mono text-[#00e5ff]">{textConfig.backgroundOpacity}%</span>
              </div>
            )}
          </div>
        </div>

        {/* MOTION ANIMATION PRESET */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-[#ccc] text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Title Animation Preset</span>
          </div>
          <select
            value={textConfig.animation}
            onChange={(e) => updateText('animation', e.target.value as TitleAnimationPreset)}
            className="w-full bg-[#121212] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none"
          >
            {animations.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
