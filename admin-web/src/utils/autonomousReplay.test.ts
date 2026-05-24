import { describe, expect, it } from 'vitest';
import {
  autonomousReplayScenario,
  getReplayFrame,
  getReplayStats,
} from './autonomousReplay';

describe('autonomousReplayScenario', () => {
  it('describes a road replay with ego vehicle, buildings, obstacles, lidar points, and cameras', () => {
    expect(autonomousReplayScenario.road.lanes).toBe(3);
    expect(autonomousReplayScenario.buildings.length).toBeGreaterThanOrEqual(6);
    expect(autonomousReplayScenario.obstacles.length).toBeGreaterThanOrEqual(5);
    expect(autonomousReplayScenario.cameras.map((camera) => camera.id)).toEqual([
      'front',
      'left',
      'right',
      'rear',
    ]);

    const firstFrame = getReplayFrame(0);

    expect(firstFrame.ego.speedKph).toBeGreaterThan(0);
    expect(firstFrame.lidarPoints.length).toBeGreaterThan(80);
    expect(firstFrame.radarDetections.length).toBeGreaterThanOrEqual(5);
    expect(firstFrame.cameraFeeds).toHaveLength(4);
    expect(firstFrame.cameraFeeds[0]).toMatchObject({
      cameraId: 'front',
      status: 'recording',
    });
  });

  it('clamps frame selection to the available replay range', () => {
    expect(getReplayFrame(-1).timestampMs).toBe(0);
    expect(getReplayFrame(99).timestampMs).toBe(
      autonomousReplayScenario.frames.at(-1)?.timestampMs,
    );
  });

  it('keeps nearby lidar points associated with visible obstacles', () => {
    const frame = getReplayFrame(2);
    const obstacleIds = new Set(frame.visibleObstacles.map((obstacle) => obstacle.id));
    const obstaclePointIds = new Set(
      frame.lidarPoints
        .filter((point) => point.source === 'obstacle')
        .map((point) => point.sourceId),
    );

    for (const obstacleId of obstacleIds) {
      expect(obstaclePointIds.has(obstacleId)).toBe(true);
    }
  });
});

describe('getReplayStats', () => {
  it('summarizes the active frame for the webviz HUD', () => {
    const stats = getReplayStats(getReplayFrame(1));

    expect(stats).toEqual({
      speedKph: 32,
      obstacleCount: 5,
      lidarPointCount: 112,
      radarDetectionCount: 5,
      cameraCount: 4,
      nearestObstacleMeters: 10.4,
    });
  });
});
