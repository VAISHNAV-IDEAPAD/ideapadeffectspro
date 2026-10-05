import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { BlendMode } from '../../types/project';
import { RotateCcw, Sliders, Volume2, Move, Layers, Eye } from 'lucide-react';

export const EffectControls: React.FC = () => {
  const { project, selectedClipId, updateClip } = useProject();

  const selectedClip = project.clips.find(c => c.id === selectedClipId);

  if (!selectedClip) {
    return (
      <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs items-center justify-center p-6 text-gray-500 text-center">
        <Sliders className="w-10 h-10 mb-2 opacity-30 text-[#388BFD]" />
        <span className="font-medium text-[#aaa]">No Clip Selected</span>
        <span className="text-[11px] mt-1 text-gray-500">Select a clip on the timeline to inspect and edit its Effect Controls.</span>
      </div>
    );
  }

  const { transform, volume, pan, name, type } = selectedClip;

  const handleTransformChange = (key: keyof typeof transform, val: any) => {
    updateClip(selectedClip.id, {
      transform: {
        ...transform,
        [key]: val,
      },
    });
  };

  const resetMotion = () => {
    updateClip(selectedClip.id, {
      transform: {
        ...transform,
        positionX: 0,
        positionY: 0,
        scale: 100,
        rotation: 0,
        opacity: 100,
      },
    });
  };

  const blendModes: BlendMode[] = [
    'normal',
    'screen',
    'multiply',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'difference',
  ];

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      {/* Panel Header */}
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-white">Effect Controls:</span>
          <span className="text-[#388BFD] font-medium truncate">{name}</span>
        </div>
        <button
          onClick={resetMotion}
          title="Reset All Motion Transforms"
          className="p-1 rounded hover:bg-[#2c2c2c] text-gray-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Accordion / Property Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-[#141414]">
        {/* MOTION SECTION */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-2.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#262626] pb-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-white tracking-wide">
              <Move className="w-3.5 h-3.5 text-[#388BFD]" />
              <span>Motion</span>
            </div>
            <button 
              onClick={resetMotion}
              className="text-[10px] text-gray-400 hover:text-white"
            >
              Reset
            </button>
          </div>

          {/* Position X / Y */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#388BFD] inline-block" title="Keyframable Property" />
                <span>Position (X, Y)</span>
              </span>
              <button 
                onClick={() => {
                  handleTransformChange('positionX', 0);
                  handleTransformChange('positionY', 0);
                }}
                className="hover:text-white"
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  value={Math.round(transform.positionX)}
                  onChange={(e) => handleTransformChange('positionX', Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#333] rounded px-2 py-1 text-xs text-[#00e5ff] font-mono outline-none focus:border-[#1473E6]"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={Math.round(transform.positionY)}
                  onChange={(e) => handleTransformChange('positionY', Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#333] rounded px-2 py-1 text-xs text-[#00e5ff] font-mono outline-none focus:border-[#1473E6]"
                />
              </div>
            </div>
          </div>

          {/* Scale Slider */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 mb-0.5">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#388BFD] inline-block" />
                <span>Scale</span>
              </span>
              <span className="text-[#00e5ff] font-mono">{transform.scale}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              value={transform.scale}
              onChange={(e) => handleTransformChange('scale', Number(e.target.value))}
              className="w-full accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 mb-0.5">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#388BFD] inline-block" />
                <span>Rotation</span>
              </span>
              <span className="text-[#00e5ff] font-mono">{transform.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={transform.rotation}
              onChange={(e) => handleTransformChange('rotation', Number(e.target.value))}
              className="w-full accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* OPACITY & BLEND MODE SECTION */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-2.5 space-y-2.5">
          <div className="flex items-center space-x-1.5 font-bold text-white tracking-wide border-b border-[#262626] pb-1.5">
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            <span>Opacity</span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
              <span>Opacity</span>
              <span className="text-[#00e5ff] font-mono">{transform.opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={transform.opacity}
              onChange={(e) => handleTransformChange('opacity', Number(e.target.value))}
              className="w-full accent-pink-500 h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="text-[10px] text-gray-400 mb-0.5">Blend Mode</div>
            <select
              value={transform.blendMode}
              onChange={(e) => handleTransformChange('blendMode', e.target.value as BlendMode)}
              className="w-full bg-[#121212] border border-[#333] rounded px-2 py-1 text-xs text-[#ddd] outline-none capitalize"
            >
              {blendModes.map(bm => (
                <option key={bm} value={bm}>{bm.replace('-', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* AUDIO SECTION (IF APPLICABLE) */}
        {type !== 'title' && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-2.5 space-y-2.5">
            <div className="flex items-center space-x-1.5 font-bold text-white tracking-wide border-b border-[#262626] pb-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Audio Channel</span>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>Volume Level</span>
                <span className="text-[#10b981] font-mono">{(volume * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={volume}
                onChange={(e) => updateClip(selectedClip.id, { volume: Number(e.target.value) })}
                className="w-full accent-[#10b981] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>Stereo Pan</span>
                <span className="text-[#10b981] font-mono">{pan === 0 ? 'Center' : pan < 0 ? `${Math.abs(pan * 100).toFixed(0)}% L` : `${(pan * 100).toFixed(0)}% R`}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={pan}
                onChange={(e) => updateClip(selectedClip.id, { pan: Number(e.target.value) })}
                className="w-full accent-[#10b981] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
