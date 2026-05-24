import { describe, expect, it } from 'vitest';
import {
  autonomyReplay,
  buildLidarPoints,
  formatReplayTime,
  getFrameAtTime,
  getSceneSummary,
} from './autonomyReplay';

describe('autonomy replay data', () => {
  it('clamps frame lookup to the recorded time range', () => {
    expect(getFrameAtTime(autonomyReplay, -1)).toBe(autonomyReplay.frames[0]);
    expect(getFrameAtTime(autonomyReplay, 999)).toBe(
      autonomyReplay.frames[autonomyReplay.frames.length - 1],
    );
  });

  it('returns the latest recorded frame at or before the requested time', () => {
    const frame = getFrameAtTime(autonomyReplay, 2.7);

    expect(frame.timestamp).toBe(2.4);
    expect(frame.vehicle.speedKph).toBe(31);
  });

  it('summarizes active perception objects and point cloud density', () => {
    const frame = getFrameAtTime(autonomyReplay, 4.8);
    const summary = getSceneSummary(autonomyReplay, frame);

    expect(summary.activeObstacleCount).toBe(5);
    expect(summary.totalPointCount).toBe(216);
    expect(summary.cameraCount).toBe(4);
  });

  it('formats replay time as fixed seconds', () => {
    expect(formatReplayTime(4.2)).toBe('4.2s');
  });

  it('expands lidar clusters into deterministic point cloud samples', () => {
    const frame = getFrameAtTime(autonomyReplay, 4.8);
    const points = buildLidarPoints(frame);

    expect(points).toHaveLength(216);
    expect(points[0]).toEqual({ id: 'pc-lead-car-4-0', x: 4.6, y: 93, intensity: 0.87 });
    expect(points[215].id).toBe('pc-left-cyclist-4-33');
  });
});
