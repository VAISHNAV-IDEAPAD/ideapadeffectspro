import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { WorkspaceTab } from '../../types/tools';
import { 
  Play, 
  Download, 
  Undo2, 
  Redo2, 
  HelpCircle, 
  Settings, 
  FolderOpen, 
  Save, 
  Plus, 
  Sliders, 
  Sparkles, 
  Layers, 
  Type, 
  Volume2,
  FileVideo
} from 'lucide-react';

interface AppHeaderProps {
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onOpenProjectSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenExport,
  onOpenShortcuts,
  onOpenProjectSettings,
}) => {
  const {
    project,
    activeWorkspace,
    setActiveWorkspace,
    undo,
    redo,
    canUndo,
    canRedo,
    resetProject,
    exportProjectJson,
    importProjectJson,
  } = useProject();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const workspaces: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
    { id: 'editing', label: 'Editing', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'color', label: 'Lumetri Color', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'effects', label: 'Effects', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'audio', label: 'Audio', icon: <Volume2 className="w-3.5 h-3.5" /> },
    { id: 'graphics', label: 'Captions & Graphics', icon: <Type className="w-3.5 h-3.5" /> },
    { id: 'export', label: 'Export', icon: <Download className="w-3.5 h-3.5" /> },
  ];

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ideapadproj,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) importProjectJson(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setActiveMenu(null);
  };

  return (
    <header className="h-10 bg-[#161616] border-b border-[#2a2a2a] flex items-center justify-between px-3 select-none text-xs z-50">
      {/* Left: Premiere Badge & Classic Menu */}
      <div className="flex items-center space-x-3">
        {/* Premiere Pro 2025 Icon Badge */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#1473E6] flex items-center justify-center shadow-sm">
            <span className="font-black text-white text-[12px] tracking-tighter">Pr</span>
          </div>
          <span className="font-bold text-[#e0e0e0] text-sm tracking-tight hidden md:inline">
            Ideapad Effects Pro <span className="text-[10px] text-[#888] font-normal">2025 (25.1)</span>
          </span>
        </div>

        {/* Standard Menu Bar */}
        <div className="relative flex items-center space-x-1 text-[#bbb]">
          {/* File Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2 py-1 rounded hover:bg-[#2c2c2c] hover:text-white transition-colors ${activeMenu === 'file' ? 'bg-[#2c2c2c] text-white' : ''}`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div 
                className="absolute top-full left-0 mt-1 w-48 bg-[#202020] border border-[#333] rounded shadow-xl py-1 z-50"
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button 
                  onClick={() => { resetProject(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1473E6] hover:text-white flex items-center space-x-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reset to Demo Sequence</span>
                </button>
                <button 
                  onClick={handleImportFile}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1473E6] hover:text-white flex items-center space-x-2"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open Project (.ideapadproj)...</span>
                </button>
                <button 
                  onClick={() => { exportProjectJson(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1473E6] hover:text-white flex items-center space-x-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Project File</span>
                </button>
                <div className="border-t border-[#333] my-1"></div>
                <button 
                  onClick={() => { onOpenProjectSettings(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1473E6] hover:text-white flex items-center space-x-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Sequence Settings...</span>
                </button>
                <button 
                  onClick={() => { onOpenExport(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1473E6] hover:text-white flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Media... (Ctrl+M)</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={`px-2 py-1 rounded hover:bg-[#2c2c2c] hover:text-white transition-colors ${activeMenu === 'edit' ? 'bg-[#2c2c2c] text-white' : ''}`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div 
                className="absolute top-full left-0 mt-1 w-44 bg-[#202020] border border-[#333] rounded shadow-xl py-1 z-50"
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button 
                  onClick={() => { undo(); setActiveMenu(null); }}
                  disabled={!canUndo}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1473E6] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-between"
                >
                  <span>Undo</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Z</span>
                </button>
                <button 
                  onClick={() => { redo(); setActiveMenu(null); }}
                  disabled={!canRedo}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1473E6] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-between"
                >
                  <span>Redo</span>
                  <span className="text-[10px] text-gray-400">Ctrl+Y</span>
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <button 
            onClick={onOpenShortcuts}
            className="px-2 py-1 rounded hover:bg-[#2c2c2c] hover:text-white transition-colors"
          >
            Help & Shortcuts
          </button>
        </div>

        {/* Quick Undo / Redo Icons */}
        <div className="hidden lg:flex items-center space-x-0.5 border-l border-[#2e2e2e] pl-2 text-[#999]">
          <button 
            onClick={undo} 
            disabled={!canUndo} 
            title="Undo (Ctrl+Z)"
            className="p-1 rounded hover:bg-[#282828] hover:text-white disabled:opacity-30"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo} 
            title="Redo (Ctrl+Y)"
            className="p-1 rounded hover:bg-[#282828] hover:text-white disabled:opacity-30"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Workspace Switcher Tabs (Premiere Pro 2025 signature top bar) */}
      <div className="flex items-center bg-[#1e1e1e] p-0.5 rounded border border-[#2e2e2e]">
        {workspaces.map(ws => {
          const isActive = activeWorkspace === ws.id;
          return (
            <button
              key={ws.id}
              onClick={() => {
                if (ws.id === 'export') {
                  onOpenExport();
                } else {
                  setActiveWorkspace(ws.id);
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-[#1473E6] text-white shadow-sm'
                  : 'text-[#aaa] hover:text-white hover:bg-[#292929]'
              }`}
            >
              {ws.icon}
              <span className="hidden sm:inline">{ws.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Project Title & Quick Export Button */}
      <div className="flex items-center space-x-3">
        <div className="hidden xl:flex items-center space-x-2 text-[#888] text-[11px]">
          <span className="truncate max-w-[160px] text-[#ccc]">{project.sequence.name}</span>
          <span className="px-1.5 py-0.5 rounded bg-[#242424] text-[10px] text-[#aaa]">
            {project.sequence.width}x{project.sequence.height} @ {project.sequence.fps}fps
          </span>
        </div>

        {/* Premiere Pro 2025 Quick Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 bg-[#1473E6] hover:bg-[#388BFD] text-white px-3 py-1 rounded font-semibold text-[11px] shadow-sm transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Quick Export</span>
        </button>
      </div>
    </header>
  );
};
