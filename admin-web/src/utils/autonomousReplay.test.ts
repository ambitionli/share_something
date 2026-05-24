import { describe, expect, it } from 'vitest';
import {
  classifyObstacleRisk,
  formatPlaybackTime,
  getReplayFrame,
  replayFrames,
  summarizeRadarDetections,
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

  it('keeps camera feeds frame-specific during playback', () => {
    expect(replayFrames[0].cameraFeeds[0].sceneShift).not.toBe(replayFrames[1].cameraFeeds[0].sceneShift);
    expect(replayFrames[0].cameraFeeds[0].detectedObjectKeys).not.toEqual(replayFrames[1].cameraFeeds[0].detectedObjectKeys);
  });

  it('summarizes radar detections by closest range and approaching targets', () => {
    const summary = summarizeRadarDetections([
      { id: 'radar-1', rangeMeters: 18, azimuthDeg: -4, relativeVelocityKph: -8, confidence: 0.9 },
      { id: 'radar-2', rangeMeters: 42, azimuthDeg: 6, relativeVelocityKph: 3, confidence: 0.7 },
      { id: 'radar-3', rangeMeters: 11, azimuthDeg: 1, relativeVelocityKph: -2, confidence: 0.82 },
    ]);

    expect(summary.total).toBe(3);
    expect(summary.approaching).toBe(2);
    expect(summary.closestRangeMeters).toBe(11);
  });

  it('classifies obstacle risk by nearest distance', () => {
    expect(classifyObstacleRisk(4.5)).toBe('danger');
    expect(classifyObstacleRisk(14)).toBe('watch');
    expect(classifyObstacleRisk(28)).toBe('clear');
  });
});
