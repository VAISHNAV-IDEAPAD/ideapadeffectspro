import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { LumetriLookPreset, defaultLumetriSettings } from '../../types/lumetri';
import { Sparkles, RotateCcw, Palette, Sliders, SunMedium, Eye } from 'lucide-react';

export const LumetriColor: React.FC = () => {
  const { project, selectedClipId, updateClip } = useProject();
  const [activeSection, setActiveSection] = useState<'basic' | 'creative' | 'vignette'>('basic');

  const selectedClip = project.clips.find(c => c.id === selectedClipId);

  if (!selectedClip) {
    return (
      <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs items-center justify-center p-6 text-gray-500 text-center">
        <Sparkles className="w-10 h-10 mb-2 opacity-30 text-[#f59e0b]" />
        <span className="font-medium text-[#aaa]">No Clip Selected</span>
        <span className="text-[11px] mt-1 text-gray-500">Select any video or graphic clip on the timeline to grade with Lumetri Color.</span>
      </div>
    );
  }

  const lumetri = selectedClip.lumetri || defaultLumetriSettings;

  const updateLumetri = (updates: any) => {
    updateClip(selectedClip.id, {
      lumetri: {
        ...lumetri,
        ...updates,
      },
    });
  };

  const updateBasic = (key: string, val: number) => {
    updateLumetri({
      basic: {
        ...lumetri.basic,
        [key]: val,
      },
    });
  };

  const updateCreative = (key: string, val: any) => {
    updateLumetri({
      creative: {
        ...lumetri.creative,
        [key]: val,
      },
    });
  };

  const updateVignette = (key: string, val: number) => {
    updateLumetri({
      vignette: {
        ...lumetri.vignette,
        [key]: val,
      },
    });
  };

  const resetLumetri = () => {
    updateClip(selectedClip.id, { lumetri: defaultLumetriSettings });
  };

  const looks: { id: LumetriLookPreset; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'teal_orange', label: 'Cyberpunk Teal & Orange' },
    { id: 'kodak_2383', label: 'Kodak 2383 Film Stock' },
    { id: 'vintage_film', label: 'Vintage Warm 1970s' },
    { id: 'noir_bw', label: 'Noir High Contrast B&W' },
    { id: 'bleach_bypass', label: 'Bleach Bypass Action' },
    { id: 'vibrant_pop', label: 'Vibrant HDR Pop' },
    { id: 'cyberpunk', label: 'Neon Cyberpunk Matrix' },
    { id: 'warm_golden', label: 'Golden Hour Sunset' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      {/* Header with Enable Switch & Reset */}
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="font-semibold text-white">Lumetri Color</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* FX Bypass Toggle */}
          <button
            onClick={() => updateLumetri({ enabled: !lumetri.enabled })}
            title="Toggle Lumetri Bypass (FX)"
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              lumetri.enabled ? 'bg-[#1473E6] text-white' : 'bg-[#333] text-gray-400'
            }`}
          >
            fx
          </button>
          <button
            onClick={resetLumetri}
            title="Reset Lumetri Parameters"
            className="p-1 rounded hover:bg-[#2c2c2c] text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lumetri Section Selector Tabs */}
      <div className="flex border-b border-[#2a2a2a] bg-[#1a1a1a]">
        {(['basic', 'creative', 'vignette'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`flex-1 py-1.5 text-center text-[11px] font-medium capitalize transition-colors ${
              activeSection === tab
                ? 'text-white border-b-2 border-[#1473E6] bg-[#222]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Parameters Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar bg-[#141414]">
        {activeSection === 'basic' && (
          <div className="space-y-3">
            {/* White Balance: Temperature & Tint */}
            <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2">
              <span className="font-bold text-[#ccc] text-[10px] uppercase tracking-wider block">White Balance</span>
              
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    <span>Temperature</span>
                  </span>
                  <span className="font-mono text-[#00e5ff]">{lumetri.basic.temperature}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={lumetri.basic.temperature}
                  onChange={(e) => updateBasic('temperature', Number(e.target.value))}
                  className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-gray-600 to-amber-500 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span>Tint</span>
                  </span>
                  <span className="font-mono text-[#00e5ff]">{lumetri.basic.tint}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={lumetri.basic.tint}
                  onChange={(e) => updateBasic('tint', Number(e.target.value))}
                  className="w-full h-1.5 bg-gradient-to-r from-emerald-500 via-gray-600 to-pink-500 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Tone Controls */}
            <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2.5">
              <span className="font-bold text-[#ccc] text-[10px] uppercase tracking-wider block">Tone</span>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Exposure (EV)</span>
                  <span className="font-mono text-[#00e5ff]">{lumetri.basic.exposure.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={lumetri.basic.exposure}
                  onChange={(e) => updateBasic('exposure', Number(e.target.value))}
                  className="w-full accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Contrast</span>
                  <span className="font-mono text-[#00e5ff]">{lumetri.basic.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={lumetri.basic.contrast}
                  onChange={(e) => updateBasic('contrast', Number(e.target.value))}
                  className="w-full accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Saturation</span>
                  <span className="font-mono text-[#00e5ff]">{lumetri.basic.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={lumetri.basic.saturation}
                  onChange={(e) => updateBasic('saturation', Number(e.target.value))}
                  className="w-full accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'creative' && (
          <div className="space-y-3">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2">
              <span className="font-bold text-[#ccc] text-[10px] uppercase tracking-wider block">Look (LUT)</span>
              <select
                value={lumetri.creative.look}
                onChange={(e) => updateCreative('look', e.target.value)}
                className="w-full bg-[#121212] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none"
              >
                {looks.map(lk => (
                  <option key={lk.id} value={lk.id}>{lk.label}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Vibrance</span>
                  <span className="font-mono text-[#00e5ff]">{lumetri.creative.vibrance}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={lumetri.creative.vibrance}
                  onChange={(e) => updateCreative('vibrance', Number(e.target.value))}
                  className="w-full accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'vignette' && (
          <div className="bg-[#1a1a1a] border border-[#262626] rounded p-2.5 space-y-2.5">
            <span className="font-bold text-[#ccc] text-[10px] uppercase tracking-wider block">Vignette</span>
            
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>Amount</span>
                <span className="font-mono text-[#00e5ff]">{lumetri.vignette.amount}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lumetri.vignette.amount}
                onChange={(e) => updateVignette('amount', Number(e.target.value))}
                className="w-full accent-[#1473E6] h-1.5 bg-[#2a2a2a] rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
