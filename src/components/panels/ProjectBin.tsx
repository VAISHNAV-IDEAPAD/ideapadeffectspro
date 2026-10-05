import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { usePlayback } from '../../context/PlaybackContext';
import { MediaItem } from '../../types/project';
import { secondsToTimecode } from '../../utils/timecode';
import { 
  FolderPlus, 
  Upload, 
  Search, 
  FileVideo, 
  Music, 
  Image as ImageIcon, 
  Type, 
  Plus, 
  Grid, 
  List, 
  Play 
} from 'lucide-react';

export const ProjectBin: React.FC = () => {
  const { project, addMedia, addClipFromMedia, addTextClip } = useProject();
  const { currentTime } = usePlayback();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredMedia = project.mediaPool.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImg = file.type.startsWith('image');

      const url = URL.createObjectURL(file);
      const newItem: MediaItem = {
        id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        url,
        duration: isImg ? 5 : 12, // estimate or extracted via metadata
        colorLabel: isVideo ? '#3b82f6' : isAudio ? '#10b981' : '#f59e0b',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };

      addMedia(newItem);
    });
  };

  const handleDropToTimeline = (item: MediaItem) => {
    const targetTrack = item.type === 'audio' 
      ? (project.tracks.find(t => t.type === 'audio' && t.target)?.id || 'a1')
      : (project.tracks.find(t => t.type === 'video' && t.target)?.id || 'v1');

    addClipFromMedia(item.id, targetTrack, currentTime);
  };

  return (
    <div className="flex flex-col h-full bg-[#181818] border border-[#2a2a2a] rounded overflow-hidden select-none text-xs">
      {/* Header */}
      <div className="h-8 bg-[#202020] border-b border-[#2e2e2e] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">Project:</span>
          <span className="text-[#aaa] truncate max-w-[120px]">{project.name}</span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 text-[#888]">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded hover:text-white ${viewMode === 'grid' ? 'text-[#388BFD] bg-[#2a2a2a]' : ''}`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1 rounded hover:text-white ${viewMode === 'list' ? 'text-[#388BFD] bg-[#2a2a2a]' : ''}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Action Buttons */}
      <div className="p-2 border-b border-[#262626] bg-[#1a1a1a] flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search Media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121212] border border-[#333] rounded pl-7 pr-2 py-1 text-xs text-[#ddd] placeholder-gray-600 outline-none focus:border-[#1473E6]"
          />
        </div>

        {/* Import Media File */}
        <label className="flex items-center space-x-1 bg-[#282828] hover:bg-[#333] text-[#ddd] hover:text-white px-2 py-1 rounded cursor-pointer transition-colors shrink-0">
          <Upload className="w-3.5 h-3.5 text-[#388BFD]" />
          <span>Import</span>
          <input 
            type="file" 
            multiple 
            accept="video/*,audio/*,image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>

        {/* New Title */}
        <button
          onClick={() => addTextClip()}
          title="Create New Title Graphic"
          className="flex items-center space-x-1 bg-[#282828] hover:bg-[#333] text-[#ddd] hover:text-white px-2 py-1 rounded transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-pink-400" />
          <span>Title</span>
        </button>
      </div>

      {/* Media Bin Items List/Grid */}
      <div className="flex-1 overflow-y-auto p-2 bg-[#141414] custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredMedia.map(item => (
              <div
                key={item.id}
                onDoubleClick={() => handleDropToTimeline(item)}
                className="group bg-[#1e1e1e] hover:bg-[#252525] border border-[#2c2c2c] hover:border-[#388BFD] rounded p-2 flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden"
              >
                {/* Media Icon & Label Banner */}
                <div className="h-16 rounded bg-[#121212] flex items-center justify-center relative overflow-hidden mb-2">
                  <div 
                    style={{ backgroundColor: item.colorLabel }} 
                    className="absolute top-0 left-0 right-0 h-1" 
                  />
                  {item.type === 'video' && <FileVideo className="w-8 h-8 text-[#388BFD] opacity-80" />}
                  {item.type === 'audio' && <Music className="w-8 h-8 text-[#10b981] opacity-80" />}
                  {item.type === 'image' && <ImageIcon className="w-8 h-8 text-[#f59e0b] opacity-80" />}
                  {item.type === 'title' && <Type className="w-8 h-8 text-pink-400 opacity-80" />}

                  {/* Add to sequence hover button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropToTimeline(item);
                    }}
                    title="Insert to Timeline at Playhead"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-1 text-white font-semibold transition-opacity"
                  >
                    <Plus className="w-4 h-4 text-[#388BFD]" />
                    <span className="text-[10px]">Add to Timeline</span>
                  </button>
                </div>

                {/* Details */}
                <div>
                  <div className="font-medium text-white truncate text-[11px]" title={item.name}>
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>{item.type.toUpperCase()}</span>
                    <span className="font-mono">{secondsToTimecode(item.duration, 30).slice(3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredMedia.map(item => (
              <div
                key={item.id}
                onDoubleClick={() => handleDropToTimeline(item)}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#252525] border border-transparent hover:border-[#388BFD] cursor-pointer group"
              >
                <div className="flex items-center space-x-2 truncate">
                  <div 
                    style={{ backgroundColor: item.colorLabel }} 
                    className="w-2.5 h-2.5 rounded-sm shrink-0" 
                  />
                  <span className="truncate text-white font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 font-mono text-[10px] shrink-0">
                  <span>{item.fileSize || 'Asset'}</span>
                  <span>{secondsToTimecode(item.duration, 30).slice(3)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropToTimeline(item);
                    }}
                    className="p-1 rounded bg-[#2e2e2e] hover:bg-[#1473E6] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
