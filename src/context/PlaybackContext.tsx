import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { audioEngine } from '../engine/AudioEngine';

interface PlaybackContextType {
  currentTime: number;
  isPlaying: boolean;
  shuttleSpeed: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  stepFrames: (frames: number, fps?: number) => void;
  shuttleReverse: () => void;
  shuttlePause: () => void;
  shuttleForward: () => void;
}

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export const PlaybackProvider: React.FC<{ children: React.ReactNode; maxDuration: number; fps?: number }> = ({
  children,
  maxDuration,
  fps = 30,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [shuttleSpeed, setShuttleSpeed] = useState<number>(1);
  
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number | null>(null);

  const seek = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(time, maxDuration));
    setCurrentTime(clamped);
  }, [maxDuration]);

  const stepFrames = useCallback((frames: number, frameRate = fps) => {
    setCurrentTime(prev => {
      const next = prev + (frames / frameRate);
      return Math.max(0, Math.min(next, maxDuration));
    });
  }, [fps, maxDuration]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    setShuttleSpeed(1);
    audioEngine.stopDemoAudio();
  }, []);

  const play = useCallback(() => {
    audioEngine.resume();
    audioEngine.playDemoAudio(currentTime, true);
    lastTimeRef.current = performance.now();
    setIsPlaying(true);
    setShuttleSpeed(1);
  }, [currentTime]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  // Shuttle J-K-L control
  const shuttleReverse = useCallback(() => {
    setShuttleSpeed(prev => (prev < 0 ? Math.max(-8, prev * 2) : -1));
    setIsPlaying(true);
    audioEngine.resume();
  }, []);

  const shuttlePause = useCallback(() => {
    pause();
  }, [pause]);

  const shuttleForward = useCallback(() => {
    setShuttleSpeed(prev => (prev > 0 ? Math.min(8, prev * 2) : 1));
    setIsPlaying(true);
    audioEngine.resume();
    audioEngine.playDemoAudio(currentTime, true);
  }, [currentTime]);

  // Continuous Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime(prev => {
        const next = prev + delta * shuttleSpeed;
        if (next >= maxDuration) {
          setIsPlaying(false);
          audioEngine.stopDemoAudio();
          return maxDuration;
        }
        if (next <= 0) {
          setIsPlaying(false);
          audioEngine.stopDemoAudio();
          return 0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, shuttleSpeed, maxDuration]);

  return (
    <PlaybackContext.Provider
      value={{
        currentTime,
        isPlaying,
        shuttleSpeed,
        play,
        pause,
        togglePlay,
        seek,
        stepFrames,
        shuttleReverse,
        shuttlePause,
        shuttleForward,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
};
