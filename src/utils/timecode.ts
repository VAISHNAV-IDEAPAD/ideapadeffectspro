export function secondsToTimecode(totalSeconds: number, fps = 30): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  
  const totalFrames = Math.floor(totalSeconds * fps);
  const frames = totalFrames % fps;
  const totalSecs = Math.floor(totalSeconds);
  const seconds = totalSecs % 60;
  const minutes = Math.floor(totalSecs / 60) % 60;
  const hours = Math.floor(totalSecs / 3600);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

export function timecodeToSeconds(tc: string, fps = 30): number {
  const parts = tc.trim().split(':').map(Number);
  if (parts.length === 4) {
    const [h, m, s, f] = parts;
    return h * 3600 + m * 60 + s + (f || 0) / fps;
  }
  if (parts.length === 3) {
    const [m, s, f] = parts;
    return m * 60 + s + (f || 0) / fps;
  }
  if (parts.length === 2) {
    const [s, f] = parts;
    return s + (f || 0) / fps;
  }
  return 0;
}

export function snapToFrame(seconds: number, fps = 30): number {
  return Math.round(seconds * fps) / fps;
}

export function formatSecondsShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
