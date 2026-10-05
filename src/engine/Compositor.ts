import { TimelineClip, TimelineTrack, SequenceSettings, MediaItem } from '../types/project';
import { LumetriSettings } from '../types/lumetri';

export interface ScopeData {
  histogramR: number[]; // 256 bins
  histogramG: number[];
  histogramB: number[];
  waveform: number[];   // sampled across 100 horizontal points
}

export class Compositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaElements: Map<string, HTMLVideoElement | HTMLImageElement> = new Map();
  private placeholderPatterns: Map<string, HTMLCanvasElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!context) throw new Error('Could not get 2D rendering context');
    this.ctx = context;
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!context) throw new Error('Could not get 2D rendering context');
    this.ctx = context;
  }

  public registerMedia(item: MediaItem) {
    if (this.mediaElements.has(item.id)) return;

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.url;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      this.mediaElements.set(item.id, video);
    } else if (item.type === 'image') {
      const img = new Image();
      img.src = item.url;
      img.crossOrigin = 'anonymous';
      this.mediaElements.set(item.id, img);
    }
  }

  public renderSequence(
    currentTime: number,
    sequence: SequenceSettings,
    tracks: TimelineTrack[],
    clips: TimelineClip[],
    mediaPool: MediaItem[],
    selectedClipId: string | null,
    isPlaying: boolean,
    showSafeMargins = false
  ) {
    const { width, height } = sequence;
    
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    const ctx = this.ctx;
    ctx.save();

    // 1. Clear background to standard Premiere Pro 2025 sequence canvas black
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, width, height);

    // 2. Identify active video/visual clips at currentTime, sorted by track index ascending (V1 -> V2 -> V3)
    const videoTracks = tracks
      .filter(t => t.type === 'video' && t.visible)
      .sort((a, b) => a.index - b.index);

    for (const track of videoTracks) {
      const trackClips = clips.filter(
        c => c.trackId === track.id && 
        currentTime >= c.startTime && 
        currentTime < (c.startTime + c.duration)
      );

      for (const clip of trackClips) {
        this.renderClip(ctx, clip, currentTime, sequence, mediaPool, isPlaying);
      }
    }

    // 3. Draw Transform Bounding Box / Gizmo if a visual clip is currently selected
    if (selectedClipId) {
      const selClip = clips.find(c => c.id === selectedClipId);
      if (selClip && currentTime >= selClip.startTime && currentTime < (selClip.startTime + selClip.duration)) {
        this.drawGizmo(ctx, selClip, sequence);
      }
    }

    // 4. Safe Margins (Premiere Pro Broadcast Safe Margins: Action 90%, Title 80%)
    if (showSafeMargins) {
      this.drawSafeMargins(ctx, width, height);
    }

    ctx.restore();
  }

  private renderClip(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    currentTime: number,
    sequence: SequenceSettings,
    mediaPool: MediaItem[],
    isPlaying: boolean
  ) {
    const elapsedInClip = currentTime - clip.startTime;
    const mediaTime = (elapsedInClip * clip.speed) + clip.trimIn;

    ctx.save();

    // 1. Transitions In & Out
    let transitionAlpha = 1.0;
    if (clip.transitionIn && clip.transitionIn.type !== 'none' && elapsedInClip < clip.transitionIn.duration) {
      const progress = elapsedInClip / clip.transitionIn.duration;
      if (clip.transitionIn.type === 'cross_dissolve' || clip.transitionIn.type === 'dip_to_black') {
        transitionAlpha *= progress;
      }
    }
    const remainingTime = clip.duration - elapsedInClip;
    if (clip.transitionOut && clip.transitionOut.type !== 'none' && remainingTime < clip.transitionOut.duration) {
      const progress = remainingTime / clip.transitionOut.duration;
      if (clip.transitionOut.type === 'cross_dissolve' || clip.transitionOut.type === 'dip_to_black') {
        transitionAlpha *= progress;
      }
    }

    // 2. Base Transform & Blending
    const { positionX, positionY, scale, rotation, opacity, blendMode } = clip.transform;
    const finalAlpha = (opacity / 100) * transitionAlpha;
    ctx.globalAlpha = Math.max(0, Math.min(1, finalAlpha));
    ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;

    // Center pivot
    const centerX = sequence.width / 2 + positionX;
    const centerY = sequence.height / 2 + positionY;

    ctx.translate(centerX, centerY);
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    const scaleFactor = scale / 100;
    ctx.scale(scaleFactor, scaleFactor);

    // 3. Lumetri Color Filter Calculation
    this.applyLumetriFilters(ctx, clip.lumetri);

    // 4. Draw Specific Clip Type
    if (clip.type === 'video' || clip.type === 'image') {
      const media = mediaPool.find(m => m.id === clip.mediaId);
      this.drawMediaContent(ctx, clip, media, mediaTime, sequence, isPlaying);
    } else if (clip.type === 'title') {
      this.drawTitleContent(ctx, clip, elapsedInClip);
    }

    // 5. Lumetri Vignette Post-effect (drawn local to clip)
    if (clip.lumetri && clip.lumetri.enabled && clip.lumetri.vignette && clip.lumetri.vignette.amount !== 0) {
      this.drawVignette(ctx, sequence.width, sequence.height, clip.lumetri.vignette.amount);
    }

    ctx.restore();
  }

  private drawMediaContent(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    media: MediaItem | undefined,
    mediaTime: number,
    sequence: SequenceSettings,
    isPlaying: boolean
  ) {
    const el = media ? this.mediaElements.get(media.id) : null;
    const w = sequence.width;
    const h = sequence.height;

    if (el && el instanceof HTMLVideoElement && el.readyState >= 2) {
      try {
        if (Math.abs(el.currentTime - mediaTime) > 0.15 && !isPlaying) {
          el.currentTime = mediaTime;
        }
        ctx.drawImage(el, -w / 2, -h / 2, w, h);
        return;
      } catch {
        // Fallback to procedural art
      }
    } else if (el && el instanceof HTMLImageElement && el.complete) {
      try {
        ctx.drawImage(el, -w / 2, -h / 2, w, h);
        return;
      } catch {
        // Fallback
      }
    }

    // Beautiful procedural Premiere Pro video generator for stock clips / demo sequences
    this.renderProceduralVideo(ctx, clip, mediaTime, w, h);
  }

  // Generates high quality stylized video graphics for instant live preview
  private renderProceduralVideo(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    time: number,
    w: number,
    h: number
  ) {
    const halfW = w / 2;
    const halfH = h / 2;

    if (clip.name.toLowerCase().includes('sunset') || clip.name.toLowerCase().includes('golden')) {
      // Golden Hour Sunset Cinematic Scene
      const grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      grad.addColorStop(0, '#1a0b2e');
      grad.addColorStop(0.3, '#79244d');
      grad.addColorStop(0.6, '#e25938');
      grad.addColorStop(0.85, '#fca34d');
      grad.addColorStop(1, '#ffdd80');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW, -halfH, w, h);

      // Glowing Sun
      const sunY = -halfH * 0.1 + Math.sin(time * 0.2) * 20;
      const sunGrad = ctx.createRadialGradient(0, sunY, 10, 0, sunY, 260);
      sunGrad.addColorStop(0, 'rgba(255, 255, 240, 1)');
      sunGrad.addColorStop(0.4, 'rgba(255, 200, 80, 0.8)');
      sunGrad.addColorStop(1, 'rgba(255, 120, 50, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, sunY, 260, 0, Math.PI * 2);
      ctx.fill();

      // Mountain Silhouettes
      ctx.fillStyle = '#11091a';
      ctx.beginPath();
      ctx.moveTo(-halfW, halfH);
      for (let x = -halfW; x <= halfW; x += 40) {
        const my = halfH * 0.35 + Math.sin(x * 0.005 + 1.2) * 90 + Math.cos(x * 0.012) * 45;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(halfW, halfH);
      ctx.closePath();
      ctx.fill();
    } else if (clip.name.toLowerCase().includes('cyber') || clip.name.toLowerCase().includes('tech') || clip.name.toLowerCase().includes('neon')) {
      // Cyberpunk Neon Grid Cityscape
      ctx.fillStyle = '#060714';
      ctx.fillRect(-halfW, -halfH, w, h);

      // Perspective 3D Grid
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;

      const horizon = 40;
      const speedOffset = (time * 120) % 60;

      // Horizontal grid lines
      for (let y = horizon; y <= halfH; y += (y - horizon + 10) * 0.3) {
        const renderY = y + (speedOffset * (y - horizon) / halfH);
        if (renderY > halfH) continue;
        ctx.beginPath();
        ctx.moveTo(-halfW, renderY);
        ctx.lineTo(halfW, renderY);
        ctx.stroke();
      }

      // Converging perspective lines
      for (let x = -halfW; x <= halfW; x += 120) {
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        ctx.lineTo(x * 3.5, halfH);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Neon Synthwave Sun
      const synthGrad = ctx.createLinearGradient(0, horizon - 280, 0, horizon);
      synthGrad.addColorStop(0, '#ff007f');
      synthGrad.addColorStop(1, '#ffea00');
      ctx.fillStyle = synthGrad;
      ctx.beginPath();
      ctx.arc(0, horizon - 40, 180, Math.PI, 0);
      ctx.fill();
    } else {
      // Modern Cinematic Studio Look / Corporate Motion
      const grad = ctx.createRadialGradient(0, 0, 80, 0, 0, halfW * 1.2);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW, -halfH, w, h);

      // Elegant floating ambient particles
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 30; i++) {
        const px = Math.sin(time * 0.3 + i * 1.5) * (halfW * 0.8);
        const py = Math.cos(time * 0.4 + i * 2.1) * (halfH * 0.8);
        const rad = 2 + (Math.sin(time + i) + 1) * 3;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawTitleContent(ctx: CanvasRenderingContext2D, clip: TimelineClip, elapsed: number) {
    const config = clip.textConfig || {
      text: clip.name,
      fontFamily: 'Montserrat',
      fontSize: 72,
      fontWeight: '700',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 0,
      hasBackground: true,
      backgroundColor: '#1473E6',
      backgroundOpacity: 85,
      hasShadow: true,
      shadowColor: 'rgba(0,0,0,0.8)',
      shadowBlur: 16,
      shadowOffsetX: 4,
      shadowOffsetY: 6,
      alignment: 'center' as const,
      animation: 'fadeIn' as const,
    };

    let displayText = config.text;

    // Title animation logic
    if (config.animation === 'typewriter') {
      const charCount = Math.floor(elapsed * 18);
      displayText = config.text.slice(0, Math.max(1, charCount));
    } else if (config.animation === 'slideUp') {
      const slide = Math.max(0, 1 - elapsed * 2.5);
      ctx.translate(0, slide * 60);
    } else if (config.animation === 'fadeIn') {
      const fade = Math.min(1, elapsed * 2);
      ctx.globalAlpha *= fade;
    }

    ctx.font = `${config.fontWeight} ${config.fontSize}px "${config.fontFamily}", sans-serif`;
    ctx.textAlign = config.alignment;
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(displayText);
    const textWidth = metrics.width;
    const textHeight = config.fontSize;

    // Optional background banner
    if (config.hasBackground) {
      ctx.save();
      const paddingX = 32;
      const paddingY = 16;
      ctx.globalAlpha *= (config.backgroundOpacity / 100);
      ctx.fillStyle = config.backgroundColor;
      
      let bgX = -textWidth / 2 - paddingX;
      if (config.alignment === 'left') bgX = -paddingX;
      if (config.alignment === 'right') bgX = -textWidth - paddingX;

      const bgY = -textHeight / 2 - paddingY;
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, textWidth + paddingX * 2, textHeight + paddingY * 2, 8);
      ctx.fill();
      ctx.restore();
    }

    // Shadow
    if (config.hasShadow) {
      ctx.shadowColor = config.shadowColor;
      ctx.shadowBlur = config.shadowBlur;
      ctx.shadowOffsetX = config.shadowOffsetX;
      ctx.shadowOffsetY = config.shadowOffsetY;
    }

    // Stroke Outline
    if (config.strokeWidth > 0) {
      ctx.strokeStyle = config.strokeColor;
      ctx.lineWidth = config.strokeWidth;
      ctx.strokeText(displayText, 0, 0);
    }

    // Main Fill Text
    ctx.fillStyle = config.color;
    ctx.fillText(displayText, 0, 0);
  }

  private applyLumetriFilters(ctx: CanvasRenderingContext2D, lumetri: LumetriSettings | undefined) {
    if (!lumetri || !lumetri.enabled) return;

    const { basic, creative } = lumetri;
    
    // Combine CSS filters
    const brightnessVal = 1 + (basic.exposure * 0.15) + (basic.whites * 0.002);
    const contrastVal = 1 + (basic.contrast * 0.008);
    const saturateVal = (basic.saturation / 100) * (1 + creative.vibrance * 0.005);
    const hueVal = basic.tint * 0.5;

    let filterStr = `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal})`;
    if (hueVal !== 0) {
      filterStr += ` hue-rotate(${hueVal}deg)`;
    }

    // Warmth / Coolness temperature emulation
    if (basic.temperature > 0) {
      filterStr += ` sepia(${basic.temperature * 0.004})`;
    }

    // Creative Look Presets
    if (creative.look === 'teal_orange') {
      filterStr += ` contrast(1.15) saturate(1.3) hue-rotate(-10deg)`;
    } else if (creative.look === 'noir_bw') {
      filterStr += ` grayscale(100%) contrast(1.35)`;
    } else if (creative.look === 'vintage_film') {
      filterStr += ` sepia(0.35) contrast(0.9) brightness(1.05)`;
    } else if (creative.look === 'bleach_bypass') {
      filterStr += ` contrast(1.4) saturate(0.65) brightness(1.1)`;
    } else if (creative.look === 'cyberpunk') {
      filterStr += ` contrast(1.25) saturate(1.6) hue-rotate(15deg)`;
    }

    ctx.filter = filterStr;
  }

  private drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
    ctx.save();
    ctx.filter = 'none';
    const halfW = width / 2;
    const halfH = height / 2;
    const outerRadius = Math.sqrt(halfW * halfW + halfH * halfH);
    const innerRadius = outerRadius * 0.45;

    const grad = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
    if (amount > 0) {
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.95, amount / 100)})`);
    } else {
      // White halo
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, `rgba(255, 255, 255, ${Math.min(0.95, Math.abs(amount) / 100)})`);
    }

    ctx.fillStyle = grad;
    ctx.fillRect(-halfW, -halfH, width, height);
    ctx.restore();
  }

  private drawGizmo(ctx: CanvasRenderingContext2D, clip: TimelineClip, sequence: SequenceSettings) {
    ctx.save();
    ctx.filter = 'none';
    ctx.globalAlpha = 1;

    const { positionX, positionY, scale, rotation } = clip.transform;
    const cx = sequence.width / 2 + positionX;
    const cy = sequence.height / 2 + positionY;

    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
    const s = scale / 100;
    const boxW = sequence.width * s;
    const boxH = sequence.height * s;

    // Premiere Pro signature blue bounding outline
    ctx.strokeStyle = '#1473E6';
    ctx.lineWidth = 2;
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

    // Corner and edge resize anchor handles
    const handleSize = 10;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1473E6';
    ctx.lineWidth = 1.5;

    const points = [
      [-boxW / 2, -boxH / 2], [0, -boxH / 2], [boxW / 2, -boxH / 2],
      [-boxW / 2, 0], [boxW / 2, 0],
      [-boxW / 2, boxH / 2], [0, boxH / 2], [boxW / 2, boxH / 2],
      [0, 0], // Center anchor point
    ];

    for (const [px, py] of points) {
      ctx.fillRect(px - handleSize / 2, py - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(px - handleSize / 2, py - handleSize / 2, handleSize, handleSize);
    }

    ctx.restore();
  }

  private drawSafeMargins(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.filter = 'none';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    // Action Safe (90%)
    const actionInsetX = width * 0.05;
    const actionInsetY = height * 0.05;
    ctx.strokeRect(actionInsetX, actionInsetY, width - actionInsetX * 2, height - actionInsetY * 2);

    // Title Safe (80%)
    const titleInsetX = width * 0.1;
    const titleInsetY = height * 0.1;
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.strokeRect(titleInsetX, titleInsetY, width - titleInsetX * 2, height - titleInsetY * 2);

    // Center Crosshair
    const midX = width / 2;
    const midY = height / 2;
    ctx.beginPath();
    ctx.moveTo(midX - 20, midY); ctx.lineTo(midX + 20, midY);
    ctx.moveTo(midX, midY - 20); ctx.lineTo(midX, midY + 20);
    ctx.stroke();

    ctx.restore();
  }

  // Real-time RGB Histogram and Waveform data extraction for Lumetri Scopes
  public getScopeData(): ScopeData {
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);
    const waveform = new Array(100).fill(0);

    try {
      // Downsample canvas to 120x80 for high performance real-time extraction
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 120;
      sampleCanvas.height = 80;
      const sCtx = sampleCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(this.canvas, 0, 0, 120, 80);
        const imgData = sCtx.getImageData(0, 0, 120, 80).data;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          histR[r]++;
          histG[g]++;
          histB[b]++;
        }

        // Horizontal luminance distribution for waveform
        for (let col = 0; col < 100; col++) {
          const sampleX = Math.floor((col / 100) * 120);
          let sumY = 0;
          for (let row = 0; row < 80; row++) {
            const idx = (row * 120 + sampleX) * 4;
            const lum = 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2];
            sumY += lum;
          }
          waveform[col] = sumY / 80; // 0 to 255
        }
      }
    } catch {
      // Fallback
    }

    return {
      histogramR: histR,
      histogramG: histG,
      histogramB: histB,
      waveform,
    };
  }
}
