import { LumetriSettings } from './lumetri';

export type MediaType = 'video' | 'audio' | 'image' | 'title';

export type BlendMode = 
  | 'normal'
  | 'screen'
  | 'multiply'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'difference';

export type TransitionType = 
  | 'none'
  | 'cross_dissolve'
  | 'dip_to_black'
  | 'dip_to_white'
  | 'wipe_left'
  | 'wipe_right'
  | 'slide_up'
  | 'zoom_blur';

export interface ClipTransition {
  type: TransitionType;
  duration: number; // in seconds (e.g. 0.5s or 1.0s)
}

export interface TransformProperties {
  positionX: number;   // delta X from center (pixels)
  positionY: number;   // delta Y from center (pixels)
  scale: number;       // 100 is 100%
  scaleX: number;      // 100 is 100%
  scaleY: number;      // 100 is 100%
  uniformScale: boolean;
  rotation: number;    // degrees (-360 to 360)
  opacity: number;     // 0 to 100
  anchorX: number;     // 0 to 1 (0.5 is center)
  anchorY: number;     // 0 to 1 (0.5 is center)
  blendMode: BlendMode;
}

export type TitleAnimationPreset = 
  | 'none'
  | 'fadeIn'
  | 'typewriter'
  | 'slideUp'
  | 'lowerThird'
  | 'glitch';

export interface TextTitleConfig {
  text: string;
  fontFamily: string;
  fontSize: number;       // in pixels (e.g. 64)
  fontWeight: string;     // '400', '700', '900'
  color: string;          // hex '#FFFFFF'
  strokeColor: string;    // hex '#000000'
  strokeWidth: number;    // 0 to 20
  hasBackground: boolean;
  backgroundColor: string;// hex '#000000'
  backgroundOpacity: number; // 0 to 100
  hasShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  alignment: 'left' | 'center' | 'right';
  animation: TitleAnimationPreset;
}

export interface Keyframe {
  id: string;
  property: 'positionX' | 'positionY' | 'scale' | 'rotation' | 'opacity' | 'volume';
  time: number; // seconds relative to clip start
  value: number;
  interpolation: 'linear' | 'ease';
}

export interface TimelineClip {
  id: string;
  trackId: string;
  mediaId: string;
  name: string;
  type: MediaType;
  startTime: number;     // timeline position in seconds
  duration: number;      // clip duration on timeline in seconds
  trimIn: number;        // media in-point offset in seconds
  trimOut: number;       // media out-point offset in seconds
  speed: number;         // 1.0 = normal
  colorLabel?: string;   // UI clip chip color (e.g., Iris, Violet, Caribbean, Forest)
  
  // Visual Transforms & Effects
  transform: TransformProperties;
  lumetri: LumetriSettings;
  transitionIn: ClipTransition;
  transitionOut: ClipTransition;
  
  // Text Title specifics
  textConfig?: TextTitleConfig;
  
  // Audio specifics
  volume: number;        // 0 to 2.0 (1.0 = 100%)
  pan: number;           // -1 (Left) to +1 (Right)
  muted: boolean;

  // Keyframing
  keyframes: Keyframe[];
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio';
  index: number;
  visible: boolean;      // eye icon for video
  locked: boolean;       // lock icon
  muted: boolean;        // Mute 'M'
  solo: boolean;         // Solo 'S' (audio only)
  volume: number;        // Track volume fader
  pan: number;           // Track stereo pan
  height: number;        // pixels for track lane
  target: boolean;       // V1/A1 targeting toggle
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string;           // object URL or placeholder / stock URL
  duration: number;      // media native duration in seconds
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  colorLabel: string;
  fps?: number;
  fileSize?: string;
}

export interface SequenceSettings {
  name: string;
  width: number;         // 1920
  height: number;        // 1080
  fps: number;           // 30 or 60
  duration: number;      // total timeline range in seconds
  inPoint: number | null; // sequence in-point marker (seconds)
  outPoint: number | null;// sequence out-point marker (seconds)
}

export interface ProjectState {
  version: string;
  name: string;
  mediaPool: MediaItem[];
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  sequence: SequenceSettings;
}
