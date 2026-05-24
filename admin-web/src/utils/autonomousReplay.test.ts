import { describe, expect, it } from 'vitest';
import {
  classifyObstacleRisk,
  formatPlaybackTime,
  getReplayFrame,
  replayFrames,
  summarizePointCloud,
} from './autonomousReplay';

describe('autonomous replay helpers', () => {
  it('clamps frame lookup to available replay frames', () => {
    expect(getReplayFrame(replayFrames, -3)).toBe(replayFrames[0]);
    expect(getReplayFrame(replayFrames, replayFrames.length + 4)).toBe(replayFrames[replayFrames.length - 1]);
  });

  it('formats replay timestamps as minute, second, and tenth-second text', () => {
    expect(formatPlaybackTime(0)).toBe('00:00.0');
    expect(formatPlaybackTime(65.27)).toBe('01:05.3');
  });

  it('summarizes point clouds by total, near field, and high intensity returns', () => {
    const summary = summarizePointCloud([
      { x: 2, y: 1, z: 0.2, intensity: 0.95 },
      { x: 12, y: 4, z: 0.1, intensity: 0.43 },
      { x: -3, y: -2, z: 0.3, intensity: 0.88 },
    ]);

    expect(summary.total).toBe(3);
    expect(summary.nearField).toBe(2);
    expect(summary.highIntensity).toBe(2);
  });

  it('classifies obstacle risk by nearest distance', () => {
    expect(classifyObstacleRisk(4.5)).toBe('danger');
    expect(classifyObstacleRisk(14)).toBe('watch');
    expect(classifyObstacleRisk(28)).toBe('clear');
  });
});
