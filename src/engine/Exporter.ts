import { SequenceSettings, TimelineClip, TimelineTrack, MediaItem } from '../types/project';
import { Compositor } from './Compositor';
import { audioEngine } from './AudioEngine';

export interface ExportOptions {
  fileName: string;
  width: number;
  height: number;
  fps: number;
  bitrate: number; // in bps, e.g. 12_000_000 for 12 Mbps
  format: 'webm' | 'mp4';
}

export type ExportProgressCallback = (progress: number, currentTime: number, totalDuration: number) => void;

export class Exporter {
  private isExporting = false;
  private shouldCancel = false;

  public async exportSequence(
    sequence: SequenceSettings,
    tracks: TimelineTrack[],
    clips: TimelineClip[],
    mediaPool: MediaItem[],
    options: ExportOptions,
    onProgress: ExportProgressCallback
  ): Promise<Blob> {
    if (this.isExporting) throw new Error('An export is already in progress');
    this.isExporting = true;
    this.shouldCancel = false;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = options.width;
    exportCanvas.height = options.height;

    const compositor = new Compositor(exportCanvas);
    
    // Determine export duration (either sequence in/out points or total clip span)
    const inPoint = sequence.inPoint ?? 0;
    let outPoint = sequence.outPoint;
    if (outPoint === null || outPoint <= inPoint) {
      const maxClipEnd = clips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0);
      outPoint = Math.max(5, maxClipEnd);
    }
    const duration = outPoint - inPoint;

    // Set up canvas stream
    const canvasStream = exportCanvas.captureStream(options.fps);
    
    // Set up audio destination stream
    const audioDestination = audioEngine.getDestination();
    if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
      const audioTrack = audioDestination.stream.getAudioTracks()[0];
      canvasStream.addTrack(audioTrack);
    }

    // Determine mimeType
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (options.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: options.bitrate,
    });

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    return new Promise<Blob>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        this.isExporting = false;
        audioEngine.stopDemoAudio();
        if (this.shouldCancel) {
          reject(new Error('Export cancelled by user'));
        } else {
          const blob = new Blob(recordedChunks, { type: mimeType });
          resolve(blob);
        }
      };

      mediaRecorder.onerror = (err) => {
        this.isExporting = false;
        audioEngine.stopDemoAudio();
        reject(err);
      };

      mediaRecorder.start(100);
      audioEngine.playDemoAudio(inPoint, true);

      const frameDuration = 1 / options.fps;
      let currentTime = inPoint;

      const renderStep = () => {
        if (this.shouldCancel) {
          mediaRecorder.stop();
          return;
        }

        compositor.renderSequence(
          currentTime,
          { ...sequence, width: options.width, height: options.height },
          tracks,
          clips,
          mediaPool,
          null,
          true,
          false
        );

        const progress = Math.min(100, Math.round(((currentTime - inPoint) / duration) * 100));
        onProgress(progress, currentTime - inPoint, duration);

        currentTime += frameDuration;

        if (currentTime <= outPoint) {
          // Process at high speed (near realtime or requestAnimationFrame)
          requestAnimationFrame(renderStep);
        } else {
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 300);
        }
      };

      renderStep();
    });
  }

  public cancel() {
    this.shouldCancel = true;
  }

  public isRunning(): boolean {
    return this.isExporting;
  }
}

export const exporter = new Exporter();
