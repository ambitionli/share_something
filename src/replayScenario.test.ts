import { describe, expect, it } from 'vitest'
import {
  getFrame,
  getFrameStats,
  replayScenario,
} from './replayScenario'

describe('replayScenario', () => {
  it('contains the road, ego vehicle, buildings, obstacles, lidar, radar, and cameras', () => {
    expect(replayScenario.road.lanes).toBe(3)
    expect(replayScenario.buildings.length).toBeGreaterThanOrEqual(8)
    expect(replayScenario.obstacles.length).toBeGreaterThanOrEqual(5)
    expect(replayScenario.cameras.map((camera) => camera.id)).toEqual([
      'front',
      'left',
      'right',
      'rear',
    ])

    const firstFrame = getFrame(0)

    expect(firstFrame.ego.speedKph).toBeGreaterThan(0)
    expect(firstFrame.lidarPoints.length).toBeGreaterThan(100)
    expect(firstFrame.radarDetections.length).toBeGreaterThanOrEqual(5)
    expect(firstFrame.cameraFeeds).toHaveLength(4)
  })

  it('clamps frame selection to the replay range', () => {
    expect(getFrame(-1).timestampMs).toBe(0)
    expect(getFrame(999).timestampMs).toBe(
      replayScenario.frames.at(-1)?.timestampMs,
    )
  })

  it('summarizes the active frame for dashboard cards', () => {
    expect(getFrameStats(getFrame(1))).toEqual({
      speedKph: 32,
      obstacleCount: 5,
      lidarPointCount: 124,
      radarDetectionCount: 5,
      cameraCount: 4,
      nearestObstacleMeters: 10.4,
    })
  })
})
