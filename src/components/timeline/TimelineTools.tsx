import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { EditorTool } from '../../types/tools';
import { 
  MousePointer, 
  ChevronsRight, 
  Scissors, 
  MoveHorizontal, 
  Hand, 
  Type, 
  PenTool, 
  Split 
} from 'lucide-react';

export const TimelineTools: React.FC = () => {
  const { activeTool, setActiveTool, addTextClip } = useProject();

  const tools: { id: EditorTool; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { id: 'selection', label: 'Selection Tool', shortcut: 'V', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'trackSelect', label: 'Track Select Forward', shortcut: 'A', icon: <ChevronsRight className="w-4 h-4" /> },
    { id: 'ripple', label: 'Ripple Edit Tool', shortcut: 'B', icon: <MoveHorizontal className="w-4 h-4" /> },
    { id: 'razor', label: 'Razor Tool', shortcut: 'C', icon: <Scissors className="w-4 h-4" /> },
    { id: 'slip', label: 'Slip Tool', shortcut: 'Y', icon: <Split className="w-4 h-4" /> },
    { id: 'pen', label: 'Pen Tool', shortcut: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'hand', label: 'Hand Tool', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
    { id: 'type', label: 'Type Tool', shortcut: 'T', icon: <Type className="w-4 h-4" /> },
  ];

  return (
    <div className="w-9 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-2 space-y-1 select-none z-20">
      {tools.map(tool => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id);
              if (tool.id === 'type') {
                addTextClip();
              }
            }}
            title={`${tool.label} (${tool.shortcut})`}
            className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-[#1473E6] text-white shadow-sm' 
                : 'text-[#8e8e8e] hover:bg-[#282828] hover:text-[#e0e0e0]'
            }`}
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
};
