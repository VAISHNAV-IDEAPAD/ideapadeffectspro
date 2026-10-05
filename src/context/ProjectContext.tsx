import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ProjectState, TimelineClip, TimelineTrack, MediaItem, SequenceSettings } from '../types/project';
import { EditorTool, WorkspaceTab } from '../types/tools';
import { defaultLumetriSettings } from '../types/lumetri';
import { initialProjectState } from '../constants/demoProject';
import { audioEngine } from '../engine/AudioEngine';

interface ProjectContextType {
  project: ProjectState;
  selectedClipId: string | null;
  activeTool: EditorTool;
  activeWorkspace: WorkspaceTab;
  timelineZoom: number;
  snapping: boolean;
  showSafeMargins: boolean;
  canUndo: boolean;
  canRedo: boolean;
  
  // State Setters
  setSelectedClipId: (id: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  setActiveWorkspace: (ws: WorkspaceTab) => void;
  setTimelineZoom: (zoom: number | ((prev: number) => number)) => void;
  setSnapping: (snap: boolean | ((prev: boolean) => boolean)) => void;
  setShowSafeMargins: (show: boolean | ((prev: boolean) => boolean)) => void;

  // Clip Modifications
  updateClip: (id: string, updates: Partial<TimelineClip>) => void;
  deleteClip: (id: string) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  splitAllClipsAt: (splitTime: number) => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  trimClip: (clipId: string, newStartTime: number, newDuration: number, newTrimIn?: number) => void;
  
  // Creation & Import
  addMedia: (item: MediaItem) => void;
  addClipFromMedia: (mediaId: string, trackId: string, startTime: number) => void;
  addTextClip: (trackId?: string, startTime?: number) => void;
  
  // Track Management
  updateTrack: (trackId: string, updates: Partial<TimelineTrack>) => void;
  setSequence: (updates: Partial<SequenceSettings>) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  resetProject: () => void;
  exportProjectJson: () => void;
  importProjectJson: (jsonStr: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem('ideapad_effects_project_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialProjectState;
  });

  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('selection');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>('editing');
  const [timelineZoom, setTimelineZoom] = useState<number>(36); // px per second
  const [snapping, setSnapping] = useState<boolean>(true);
  const [showSafeMargins, setShowSafeMargins] = useState<boolean>(false);

  // History stacks
  const [undoStack, setUndoStack] = useState<ProjectState[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectState[]>([]);

  // Push history on state change
  const pushState = useCallback((newState: ProjectState) => {
    setUndoStack(prev => [...prev.slice(-30), project]);
    setRedoStack([]);
    setProject(newState);
  }, [project]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ideapad_effects_project_v1', JSON.stringify(project));
    } catch {
      // Storage quota or sandboxed
    }

    // Sync Audio Engine Tracks
    const anySolo = project.tracks.some(t => t.type === 'audio' && t.solo);
    project.tracks.forEach(track => {
      if (track.type === 'audio') {
        audioEngine.updateTrack(track.id, track.volume, track.pan, track.muted, track.solo, anySolo);
      }
    });
  }, [project]);

  // Undo / Redo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, project]);
    setUndoStack(u => u.slice(0, -1));
    setProject(prev);
  }, [undoStack, project]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, project]);
    setRedoStack(r => r.slice(0, -1));
    setProject(next);
  }, [redoStack, project]);

  // Clip Operations
  const updateClip = useCallback((id: string, updates: Partial<TimelineClip>) => {
    setProject(curr => {
      const nextClips = curr.clips.map(c => (c.id === id ? { ...c, ...updates } : c));
      return { ...curr, clips: nextClips };
    });
  }, []);

  const deleteClip = useCallback((id: string) => {
    pushState({
      ...project,
      clips: project.clips.filter(c => c.id !== id),
    });
    if (selectedClipId === id) setSelectedClipId(null);
  }, [project, selectedClipId, pushState]);

  // Premiere Pro Razor Split Tool (C)
  const splitClip = useCallback((clipId: string, splitTime: number) => {
    const clip = project.clips.find(c => c.id === clipId);
    if (!clip) return;
    if (splitTime <= clip.startTime + 0.1 || splitTime >= clip.startTime + clip.duration - 0.1) return;

    const leftDuration = splitTime - clip.startTime;
    const rightDuration = clip.duration - leftDuration;
    const rightTrimIn = clip.trimIn + leftDuration * clip.speed;

    const leftClip: TimelineClip = {
      ...clip,
      duration: leftDuration,
      trimOut: clip.trimIn + leftDuration * clip.speed,
    };

    const rightClip: TimelineClip = {
      ...clip,
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      startTime: splitTime,
      duration: rightDuration,
      trimIn: rightTrimIn,
    };

    pushState({
      ...project,
      clips: project.clips.map(c => (c.id === clipId ? leftClip : c)).concat(rightClip),
    });
    setSelectedClipId(rightClip.id);
  }, [project, pushState]);

  // Razor split all overlapping clips at playhead
  const splitAllClipsAt = useCallback((splitTime: number) => {
    const targetClips = project.clips.filter(
      c => splitTime > c.startTime + 0.1 && splitTime < c.startTime + c.duration - 0.1
    );
    if (targetClips.length === 0) return;

    let updatedClips = [...project.clips];

    for (const clip of targetClips) {
      const leftDuration = splitTime - clip.startTime;
      const rightDuration = clip.duration - leftDuration;
      const rightTrimIn = clip.trimIn + leftDuration * clip.speed;

      const leftClip: TimelineClip = {
        ...clip,
        duration: leftDuration,
        trimOut: clip.trimIn + leftDuration * clip.speed,
      };

      const rightClip: TimelineClip = {
        ...clip,
        id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: splitTime,
        duration: rightDuration,
        trimIn: rightTrimIn,
      };

      updatedClips = updatedClips.map(c => (c.id === clip.id ? leftClip : c)).concat(rightClip);
    }

    pushState({ ...project, clips: updatedClips });
  }, [project, pushState]);

  // Move clip in time and track
  const moveClip = useCallback((clipId: string, newStartTime: number, newTrackId?: string) => {
    const clampedTime = Math.max(0, newStartTime);
    setProject(curr => {
      const clips = curr.clips.map(c => {
        if (c.id !== clipId) return c;
        return {
          ...c,
          startTime: clampedTime,
          trackId: newTrackId || c.trackId,
        };
      });
      return { ...curr, clips };
    });
  }, []);

  // Trim clip head or tail
  const trimClip = useCallback((clipId: string, newStartTime: number, newDuration: number, newTrimIn?: number) => {
    setProject(curr => {
      const clips = curr.clips.map(c => {
        if (c.id !== clipId) return c;
        return {
          ...c,
          startTime: Math.max(0, newStartTime),
          duration: Math.max(0.2, newDuration),
          trimIn: newTrimIn !== undefined ? Math.max(0, newTrimIn) : c.trimIn,
        };
      });
      return { ...curr, clips };
    });
  }, []);

  // Media pool import
  const addMedia = useCallback((item: MediaItem) => {
    setProject(curr => ({
      ...curr,
      mediaPool: [...curr.mediaPool, item],
    }));
  }, []);

  // Place clip from Project Bin to Timeline
  const addClipFromMedia = useCallback((mediaId: string, trackId: string, startTime: number) => {
    const media = project.mediaPool.find(m => m.id === mediaId);
    if (!media) return;

    const newClip: TimelineClip = {
      id: `clip_${Date.now()}`,
      trackId,
      mediaId,
      name: media.name,
      type: media.type,
      startTime: Math.max(0, startTime),
      duration: Math.min(10, media.duration || 5),
      trimIn: 0,
      trimOut: Math.min(10, media.duration || 5),
      speed: 1.0,
      colorLabel: media.colorLabel,
      transform: {
        positionX: 0,
        positionY: 0,
        scale: 100,
        scaleX: 100,
        scaleY: 100,
        uniformScale: true,
        rotation: 0,
        opacity: 100,
        anchorX: 0.5,
        anchorY: 0.5,
        blendMode: 'normal',
      },
      lumetri: defaultLumetriSettings,
      transitionIn: { type: 'none', duration: 0 },
      transitionOut: { type: 'none', duration: 0 },
      volume: 1,
      pan: 0,
      muted: false,
      keyframes: [],
    };

    pushState({
      ...project,
      clips: [...project.clips, newClip],
    });
    setSelectedClipId(newClip.id);
  }, [project, pushState]);

  // Essential Graphics: Add Text Title
  const addTextClip = useCallback((trackId = 'v3', startTime = 0) => {
    const newTitleClip: TimelineClip = {
      id: `clip_title_${Date.now()}`,
      trackId,
      mediaId: 'med_title_main',
      name: 'Title - Text Graphic',
      type: 'title',
      startTime,
      duration: 5.0,
      trimIn: 0,
      trimOut: 5.0,
      speed: 1.0,
      colorLabel: '#ec4899',
      transform: {
        positionX: 0,
        positionY: 0,
        scale: 100,
        scaleX: 100,
        scaleY: 100,
        uniformScale: true,
        rotation: 0,
        opacity: 100,
        anchorX: 0.5,
        anchorY: 0.5,
        blendMode: 'normal',
      },
      lumetri: defaultLumetriSettings,
      transitionIn: { type: 'cross_dissolve', duration: 0.5 },
      transitionOut: { type: 'cross_dissolve', duration: 0.5 },
      textConfig: {
        text: 'NEW TITLE GRAPHIC',
        fontFamily: 'Montserrat',
        fontSize: 64,
        fontWeight: '800',
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        hasBackground: true,
        backgroundColor: '#1473E6',
        backgroundOpacity: 85,
        hasShadow: true,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 14,
        shadowOffsetX: 3,
        shadowOffsetY: 5,
        alignment: 'center',
        animation: 'slideUp',
      },
      volume: 1,
      pan: 0,
      muted: false,
      keyframes: [],
    };

    pushState({
      ...project,
      clips: [...project.clips, newTitleClip],
    });
    setSelectedClipId(newTitleClip.id);
    setActiveWorkspace('graphics');
  }, [project, pushState]);

  const updateTrack = useCallback((trackId: string, updates: Partial<TimelineTrack>) => {
    setProject(curr => ({
      ...curr,
      tracks: curr.tracks.map(t => (t.id === trackId ? { ...t, ...updates } : t)),
    }));
  }, []);

  const setSequence = useCallback((updates: Partial<SequenceSettings>) => {
    setProject(curr => ({
      ...curr,
      sequence: { ...curr.sequence, ...updates },
    }));
  }, []);

  const resetProject = useCallback(() => {
    pushState(initialProjectState);
    setSelectedClipId(null);
  }, [pushState]);

  const exportProjectJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}.ideapadproj`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [project]);

  const importProjectJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tracks && parsed.clips) {
        pushState(parsed);
        return true;
      }
    } catch {
      // Invalid JSON
    }
    return false;
  }, [pushState]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        selectedClipId,
        activeTool,
        activeWorkspace,
        timelineZoom,
        snapping,
        showSafeMargins,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        setSelectedClipId,
        setActiveTool,
        setActiveWorkspace,
        setTimelineZoom,
        setSnapping,
        setShowSafeMargins,
        updateClip,
        deleteClip,
        splitClip,
        splitAllClipsAt,
        moveClip,
        trimClip,
        addMedia,
        addClipFromMedia,
        addTextClip,
        updateTrack,
        setSequence,
        undo,
        redo,
        resetProject,
        exportProjectJson,
        importProjectJson,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};
