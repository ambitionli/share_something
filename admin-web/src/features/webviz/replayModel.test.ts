import { describe, expect, it } from 'vitest';
import { createWebvizReplay, frameAtTime, playbackSummary } from './replayModel';

describe('webviz replay model', () => {
  it('builds a deterministic autonomous driving replay scene', () => {
    const replay = createWebvizReplay();

    expect(replay.frames.length).toBeGreaterThan(4);
    expect(replay.frames[0]?.ego.speedKph).toBeGreaterThan(0);
    expect(replay.frames[0]?.lidarPoints.length).toBeGreaterThan(25);
    expect(replay.cameraFeeds.map((feed) => feed.name)).toEqual([
      'Front',
      'Left',
      'Right',
      'Rear',
    ]);
  });

  it('clamps requested playback time to the closest available frame', () => {
    const replay = createWebvizReplay();

    expect(frameAtTime(replay, -10).timeMs).toBe(0);
    expect(frameAtTime(replay, replay.durationMs + 1000).timeMs).toBe(replay.durationMs);
  });

  it('summarizes lidar, camera, and obstacle counts for the dashboard', () => {
    const summary = playbackSummary(createWebvizReplay());

    expect(summary.totalFrames).toBeGreaterThan(4);
    expect(summary.maxLidarPoints).toBeGreaterThan(25);
    expect(summary.cameraCount).toBe(4);
    expect(summary.obstacleCount).toBeGreaterThanOrEqual(6);
  });
});
