export type ObstacleType = 'vehicle' | 'pedestrian' | 'cone' | 'barrier' | 'cyclist'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface RoadModel {
  lanes: number
  laneWidthMeters: number
  lengthMeters: number
}

export interface BuildingModel {
  id: string
  side: 'left' | 'right'
  worldY: number
  width: number
  height: number
  color: string
}

export interface ObstacleModel {
  id: string
  type: ObstacleType
  label: string
  x: number
  worldY: number
  width: number
  length: number
  risk: RiskLevel
}

export interface CameraModel {
  id: 'front' | 'left' | 'right' | 'rear'
  title: string
  fovDegrees: number
}

export interface EgoState {
  x: number
  worldY: number
  headingDegrees: number
  speedKph: number
}

export interface LidarPoint {
  id: string
  x: number
  y: number
  intensity: number
  source: 'road' | 'building' | 'obstacle'
  sourceId?: string
}

export interface RadarDetection {
  id: string
  obstacleId: string
  rangeMeters: number
  angleDegrees: number
  relativeSpeedKph: number
  risk: RiskLevel
}

export interface CameraFeed {
  cameraId: CameraModel['id']
  title: string
  detectedObstacleIds: string[]
}

export interface ReplayFrame {
  frameIndex: number
  timestampMs: number
  ego: EgoState
  visibleObstacles: ObstacleModel[]
  lidarPoints: LidarPoint[]
  radarDetections: RadarDetection[]
  cameraFeeds: CameraFeed[]
}

export interface ReplayScenario {
  road: RoadModel
  buildings: BuildingModel[]
  obstacles: ObstacleModel[]
  cameras: CameraModel[]
  frames: ReplayFrame[]
}

const road: RoadModel = {
  lanes: 3,
  laneWidthMeters: 3.6,
  lengthMeters: 120,
}

const buildings: BuildingModel[] = [
  { id: 'b-left-1', side: 'left', worldY: 8, width: 11, height: 32, color: '#4b5563' },
  { id: 'b-right-1', side: 'right', worldY: 12, width: 12, height: 28, color: '#64748b' },
  { id: 'b-left-2', side: 'left', worldY: 28, width: 12, height: 38, color: '#334155' },
  { id: 'b-right-2', side: 'right', worldY: 34, width: 9, height: 30, color: '#475569' },
  { id: 'b-left-3', side: 'left', worldY: 52, width: 13, height: 42, color: '#1f2937' },
  { id: 'b-right-3', side: 'right', worldY: 58, width: 11, height: 34, color: '#546e7a' },
  { id: 'b-left-4', side: 'left', worldY: 82, width: 12, height: 36, color: '#374151' },
  { id: 'b-right-4', side: 'right', worldY: 88, width: 14, height: 44, color: '#455a64' },
]

const obstacles: ObstacleModel[] = [
  {
    id: 'obs-sedan',
    type: 'vehicle',
    label: 'Slow vehicle ahead',
    x: 0,
    worldY: 18.4,
    width: 2.2,
    length: 4.6,
    risk: 'medium',
  },
  {
    id: 'obs-pedestrian',
    type: 'pedestrian',
    label: 'Pedestrian on right',
    x: 4.8,
    worldY: 26,
    width: 0.8,
    length: 0.8,
    risk: 'high',
  },
  {
    id: 'obs-cones',
    type: 'cone',
    label: 'Construction cones',
    x: -3.4,
    worldY: 31,
    width: 1,
    length: 1,
    risk: 'low',
  },
  {
    id: 'obs-barrier',
    type: 'barrier',
    label: 'Road barrier',
    x: -5.1,
    worldY: 39,
    width: 3.2,
    length: 1.2,
    risk: 'medium',
  },
  {
    id: 'obs-cyclist',
    type: 'cyclist',
    label: 'Cyclist on left',
    x: 5.4,
    worldY: 44,
    width: 1.1,
    length: 1.8,
    risk: 'high',
  },
]

const cameras: CameraModel[] = [
  { id: 'front', title: 'Front Camera', fovDegrees: 110 },
  { id: 'left', title: 'Left Camera', fovDegrees: 95 },
  { id: 'right', title: 'Right Camera', fovDegrees: 95 },
  { id: 'rear', title: 'Rear Camera', fovDegrees: 120 },
]

const keyframes: Array<{ timestampMs: number; ego: EgoState }> = [
  { timestampMs: 0, ego: { x: 0, worldY: 0, headingDegrees: 0, speedKph: 28 } },
  { timestampMs: 1000, ego: { x: 0.15, worldY: 8, headingDegrees: 1, speedKph: 32 } },
  { timestampMs: 2000, ego: { x: 0.35, worldY: 16, headingDegrees: 2, speedKph: 36 } },
  { timestampMs: 3000, ego: { x: 0.1, worldY: 24, headingDegrees: -1, speedKph: 30 } },
  { timestampMs: 4000, ego: { x: -0.2, worldY: 32, headingDegrees: -2, speedKph: 24 } },
  { timestampMs: 5000, ego: { x: 0, worldY: 40, headingDegrees: 0, speedKph: 22 } },
]

function relativeY(worldY: number, ego: EgoState): number {
  return Number((worldY - ego.worldY).toFixed(1))
}

function visibleObstaclesFor(ego: EgoState): ObstacleModel[] {
  return obstacles.filter((obstacle) => {
    const y = relativeY(obstacle.worldY, ego)
    return y >= -22 && y <= 48
  })
}

function roadLidarPoints(ego: EgoState): LidarPoint[] {
  const laneOffsets = [-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4]
  const depths = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48]

  return laneOffsets.flatMap((x, laneIndex) =>
    depths.map((y, depthIndex) => ({
      id: `road-${laneIndex}-${depthIndex}`,
      x: Number((x - ego.x * 0.2).toFixed(2)),
      y,
      intensity: depthIndex % 3 === 0 ? 0.38 : 0.26,
      source: 'road' as const,
    })),
  )
}

function buildingLidarPoints(ego: EgoState): LidarPoint[] {
  return Array.from({ length: 20 }, (_, index) => {
    const building = buildings[index % buildings.length]
    const sideSign = building.side === 'left' ? -1 : 1

    return {
      id: `building-${building.id}-${index}`,
      x: sideSign * (8.8 + (index % 2) * 1.5),
      y: relativeY(building.worldY + Math.floor(index / buildings.length) * 3, ego),
      intensity: 0.52 + (index % 3) * 0.08,
      source: 'building' as const,
      sourceId: building.id,
    }
  })
}

function obstacleLidarPoints(visibleObstacles: ObstacleModel[], ego: EgoState): LidarPoint[] {
  return visibleObstacles.flatMap((obstacle) => {
    const y = relativeY(obstacle.worldY, ego)
    const halfWidth = obstacle.width / 2
    const halfLength = obstacle.length / 2

    return [
      { x: obstacle.x - halfWidth, y: y - halfLength },
      { x: obstacle.x + halfWidth, y: y - halfLength },
      { x: obstacle.x - halfWidth, y: y + halfLength },
      { x: obstacle.x + halfWidth, y: y + halfLength },
    ].map((point, index) => ({
      id: `${obstacle.id}-corner-${index}`,
      x: Number(point.x.toFixed(2)),
      y: Number(point.y.toFixed(2)),
      intensity: obstacle.risk === 'high' ? 0.96 : 0.78,
      source: 'obstacle' as const,
      sourceId: obstacle.id,
    }))
  })
}

function radarDetectionsFor(visibleObstacles: ObstacleModel[], ego: EgoState): RadarDetection[] {
  return visibleObstacles.map((obstacle) => {
    const dx = obstacle.x - ego.x
    const dy = obstacle.worldY - ego.worldY

    return {
      id: `radar-${obstacle.id}`,
      obstacleId: obstacle.id,
      rangeMeters: Number(Math.hypot(dx, dy).toFixed(1)),
      angleDegrees: Number((Math.atan2(dx, dy) * (180 / Math.PI)).toFixed(1)),
      relativeSpeedKph: obstacle.type === 'vehicle' ? -8 : 0,
      risk: obstacle.risk,
    }
  })
}

function cameraFeedsFor(visibleObstacles: ObstacleModel[]): CameraFeed[] {
  const detectedObstacleIds = visibleObstacles.map((obstacle) => obstacle.id)

  return cameras.map((camera) => ({
    cameraId: camera.id,
    title: camera.title,
    detectedObstacleIds,
  }))
}

function buildFrame(keyframe: (typeof keyframes)[number], frameIndex: number): ReplayFrame {
  const visibleObstacles = visibleObstaclesFor(keyframe.ego)

  return {
    frameIndex,
    timestampMs: keyframe.timestampMs,
    ego: keyframe.ego,
    visibleObstacles,
    lidarPoints: [
      ...roadLidarPoints(keyframe.ego),
      ...buildingLidarPoints(keyframe.ego),
      ...obstacleLidarPoints(visibleObstacles, keyframe.ego),
    ],
    radarDetections: radarDetectionsFor(visibleObstacles, keyframe.ego),
    cameraFeeds: cameraFeedsFor(visibleObstacles),
  }
}

export const replayScenario: ReplayScenario = {
  road,
  buildings,
  obstacles,
  cameras,
  frames: keyframes.map(buildFrame),
}

export function getFrame(frameIndex: number): ReplayFrame {
  const lastIndex = replayScenario.frames.length - 1
  const safeIndex = Math.min(Math.max(Math.trunc(frameIndex), 0), lastIndex)

  return replayScenario.frames[safeIndex]
}

export function getFrameStats(frame: ReplayFrame) {
  const nearestObstacleMeters = frame.visibleObstacles.reduce((nearest, obstacle) => {
    const dx = obstacle.x - frame.ego.x
    const dy = obstacle.worldY - frame.ego.worldY
    return Math.min(nearest, Math.hypot(dx, dy))
  }, Number.POSITIVE_INFINITY)

  return {
    speedKph: frame.ego.speedKph,
    obstacleCount: frame.visibleObstacles.length,
    lidarPointCount: frame.lidarPoints.length,
    radarDetectionCount: frame.radarDetections.length,
    cameraCount: frame.cameraFeeds.length,
    nearestObstacleMeters: Number(nearestObstacleMeters.toFixed(1)),
  }
}
