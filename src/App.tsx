import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { PlaybackProvider, usePlayback } from './context/PlaybackContext';
import { AppHeader } from './components/header/AppHeader';
import { ProgramMonitor } from './components/monitors/ProgramMonitor';
import { SourceMonitor } from './components/monitors/SourceMonitor';
import { Timeline } from './components/timeline/Timeline';
import { TimelineTools } from './components/timeline/TimelineTools';
import { ProjectBin } from './components/panels/ProjectBin';
import { EffectControls } from './components/panels/EffectControls';
import { LumetriColor } from './components/panels/LumetriColor';
import { LumetriScopes } from './components/panels/LumetriScopes';
import { EssentialGraphics } from './components/panels/EssentialGraphics';
import { EffectsLibrary } from './components/panels/EffectsLibrary';
import { AudioVUMeter } from './components/meters/AudioVUMeter';
import { AudioMixer } from './components/panels/AudioMixer';
import { ExportModal } from './components/modals/ExportModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { ProjectSettingsModal } from './components/modals/ProjectSettingsModal';

const EditorLayout: React.FC = () => {
  const {
    project,
    activeWorkspace,
    setActiveWorkspace,
    selectedClipId,
    deleteClip,
    activeTool,
    setActiveTool,
    addTextClip,
    splitAllClipsAt,
    undo,
    redo,
    setSequence,
  } = useProject();

  const {
    currentTime,
    togglePlay,
    stepFrames,
    seek,
    shuttleReverse,
    shuttlePause,
    shuttleForward,
  } = usePlayback();

  // Tab switching inside left quadrants
  const [topLeftTab, setTopLeftTab] = useState<'source' | 'effects' | 'lumetri' | 'scopes' | 'mixer'>('effects');
  const [bottomLeftTab, setBottomLeftTab] = useState<'bin' | 'fxLibrary' | 'graphics'>('bin');

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-switch tabs when workspace changes
  useEffect(() => {
    if (activeWorkspace === 'color') {
      setTopLeftTab('lumetri');
    } else if (activeWorkspace === 'effects') {
      setTopLeftTab('effects');
      setBottomLeftTab('fxLibrary');
    } else if (activeWorkspace === 'audio') {
      setTopLeftTab('mixer');
    } else if (activeWorkspace === 'graphics') {
      setBottomLeftTab('graphics');
    } else if (activeWorkspace === 'export') {
      setIsExportOpen(true);
    }
  }, [activeWorkspace]);

  // Global Keyboard Shortcuts (Premiere Pro 2025 standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Space: Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      // J, K, L Shuttle
      else if (e.key === 'j' || e.key === 'J') {
        shuttleReverse();
      } else if (e.key === 'k' || e.key === 'K') {
        shuttlePause();
      } else if (e.key === 'l' || e.key === 'L') {
        shuttleForward();
      }
      // Step frames
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFrames(e.shiftKey ? -5 : -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepFrames(e.shiftKey ? 5 : 1);
      }
      // Home / End
      else if (e.key === 'Home') {
        seek(0);
      } else if (e.key === 'End') {
        seek(project.sequence.duration);
      }
      // In & Out Points
      else if (e.key === 'i' || e.key === 'I') {
        setSequence({ inPoint: currentTime });
      } else if (e.key === 'o' || e.key === 'O') {
        setSequence({ outPoint: currentTime });
      }
      // Tools
      else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('selection');
      } else if (e.key === 'c' || e.key === 'C') {
        setActiveTool('razor');
      } else if (e.key === 'b' || e.key === 'B') {
        setActiveTool('ripple');
      } else if (e.key === 'a' || e.key === 'A') {
        setActiveTool('trackSelect');
      } else if (e.key === 't' || e.key === 'T') {
        addTextClip();
      }
      // Cut at playhead: Ctrl+K
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        splitAllClipsAt(currentTime);
      }
      // Export: Ctrl+M
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsExportOpen(true);
      }
      // Undo: Ctrl+Z
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      else if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        redo();
      }
      // Delete selected clip
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
        deleteClip(selectedClipId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    shuttleReverse,
    shuttlePause,
    shuttleForward,
    stepFrames,
    seek,
    currentTime,
    project.sequence.duration,
    setSequence,
    setActiveTool,
    addTextClip,
    splitAllClipsAt,
    undo,
    redo,
    selectedClipId,
    deleteClip,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#111] overflow-hidden text-[#d4d4d4]">
      {/* Top Premiere Spectrum Header */}
      <AppHeader
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenProjectSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Docking Workspace Area */}
      <div className="flex-1 flex flex-col min-h-0 p-1.5 gap-1.5">
        {/* UPPER HALF: Source/Effects Panels (Left) & Program Monitor (Right) */}
        <div className="h-[52%] flex gap-1.5 min-h-0">
          {/* Top-Left Quadrant with Tabs */}
          <div className="w-[45%] flex flex-col min-w-[340px] bg-[#1a1a1a] rounded border border-[#2c2c2c] overflow-hidden">
            {/* Top-Left Quadrant Tab Selector */}
            <div className="h-7 bg-[#222] border-b border-[#2d2d2d] flex items-center px-1 space-x-1 select-none text-[11px]">
              <button
                onClick={() => setTopLeftTab('effects')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  topLeftTab === 'effects'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Effect Controls
              </button>
              <button
                onClick={() => setTopLeftTab('source')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  topLeftTab === 'source'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Source Monitor
              </button>
              <button
                onClick={() => setTopLeftTab('lumetri')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  topLeftTab === 'lumetri'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Lumetri Color
              </button>
              <button
                onClick={() => setTopLeftTab('scopes')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  topLeftTab === 'scopes'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Scopes
              </button>
              <button
                onClick={() => setTopLeftTab('mixer')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  topLeftTab === 'mixer'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Track Mixer
              </button>
            </div>

            {/* Top-Left Content */}
            <div className="flex-1 min-h-0">
              {topLeftTab === 'effects' && <EffectControls />}
              {topLeftTab === 'source' && <SourceMonitor />}
              {topLeftTab === 'lumetri' && <LumetriColor />}
              {topLeftTab === 'scopes' && <LumetriScopes />}
              {topLeftTab === 'mixer' && <AudioMixer />}
            </div>
          </div>

          {/* Top-Right Quadrant: Program Monitor & Dual Master VU Meter */}
          <div className="flex-1 flex gap-1.5 min-w-[400px]">
            <div className="flex-1 min-h-0">
              <ProgramMonitor />
            </div>
            {/* Dynamic VU Meter */}
            <AudioVUMeter />
          </div>
        </div>

        {/* LOWER HALF: Project Bin / FX (Left), Center Toolbar, and Multi-track Timeline (Right) */}
        <div className="h-[48%] flex gap-1.5 min-h-0">
          {/* Bottom-Left Quadrant: Project Bin, FX Library, Graphics */}
          <div className="w-[30%] min-w-[280px] max-w-[440px] flex flex-col bg-[#1a1a1a] rounded border border-[#2c2c2c] overflow-hidden">
            <div className="h-7 bg-[#222] border-b border-[#2d2d2d] flex items-center px-1 space-x-1 select-none text-[11px]">
              <button
                onClick={() => setBottomLeftTab('bin')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  bottomLeftTab === 'bin'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Project Media
              </button>
              <button
                onClick={() => setBottomLeftTab('fxLibrary')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  bottomLeftTab === 'fxLibrary'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Effects
              </button>
              <button
                onClick={() => setBottomLeftTab('graphics')}
                className={`px-3 py-1 rounded-t transition-colors font-medium ${
                  bottomLeftTab === 'graphics'
                    ? 'bg-[#181818] text-white border-t-2 border-[#1473E6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Essential Graphics
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {bottomLeftTab === 'bin' && <ProjectBin />}
              {bottomLeftTab === 'fxLibrary' && <EffectsLibrary />}
              {bottomLeftTab === 'graphics' && <EssentialGraphics />}
            </div>
          </div>

          {/* Premiere Center Vertical Toolbar */}
          <TimelineTools />

          {/* Timeline Multi-Track Workstation */}
          <div className="flex-1 min-h-0">
            <Timeline />
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => {
          setIsExportOpen(false);
          if (activeWorkspace === 'export') setActiveWorkspace('editing');
        }}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ProjectProvider>
      <PlaybackProvider maxDuration={35} fps={30}>
        <EditorLayout />
      </PlaybackProvider>
    </ProjectProvider>
  );
};

export default App;
