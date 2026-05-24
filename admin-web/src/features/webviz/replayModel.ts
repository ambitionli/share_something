export type ObstacleType = 'vehicle' | 'pedestrian' | 'barrier' | 'cone';

export interface EgoPose {
  x: number;
  y: number;
  headingDeg: number;
  speedKph: number;
}

export interface LidarPoint {
  id: string;
  x: number;
  y: number;
  intensity: number;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  risk: 'low' | 'medium' | 'high';
}

export interface Building {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface CameraFeed {
  id: 'front' | 'left' | 'right' | 'rear';
  name: string;
  position: string;
  accent: string;
}

export interface CameraSnapshot {
  labelKey: 'frontRoad' | 'leftCurb' | 'rightCurb' | 'rearRoad';
  descriptionKey:
    | 'frontClear'
    | 'frontPedestrian'
    | 'leftCurb'
    | 'rightStation'
    | 'rightPedestrian'
    | 'rearRoad';
  alertKey?: 'pedestrianCrosswalk' | 'vruCandidate';
}

export interface ReplayFrame {
  timeMs: number;
  ego: EgoPose;
  lidarPoints: LidarPoint[];
  obstacles: Obstacle[];
  cameraSnapshots: Record<CameraFeed['id'], CameraSnapshot>;
}

export interface WebvizReplay {
  durationMs: number;
  roadWidth: number;
  laneCenterX: number;
  buildings: Building[];
  cameraFeeds: CameraFeed[];
  frames: ReplayFrame[];
}

export interface PlaybackSummary {
  totalFrames: number;
  maxLidarPoints: number;
  cameraCount: number;
  obstacleCount: number;
}

const CAMERA_FEEDS: CameraFeed[] = [
  { id: 'front', name: 'Front', position: '前视 120°', accent: '#22c55e' },
  { id: 'left', name: 'Left', position: '左侧广角', accent: '#38bdf8' },
  { id: 'right', name: 'Right', position: '右侧广角', accent: '#f59e0b' },
  { id: 'rear', name: 'Rear', position: '后视', accent: '#a78bfa' },
];

const BUILDINGS: Building[] = [
  { id: 'b-01', x: 42, y: 34, width: 110, height: 92, label: 'Office A' },
  { id: 'b-02', x: 50, y: 160, width: 96, height: 128, label: 'Mall' },
  { id: 'b-03', x: 58, y: 330, width: 104, height: 96, label: 'Hotel' },
  { id: 'b-04', x: 642, y: 46, width: 118, height: 112, label: 'Park Tower' },
  { id: 'b-05', x: 656, y: 196, width: 94, height: 102, label: 'Station' },
  { id: 'b-06', x: 632, y: 338, width: 128, height: 86, label: 'Depot' },
];

const BASE_OBSTACLES: Array<Omit<Obstacle, 'y'> & { yStart: number; drift: number }> = [
  {
    id: 'veh-01',
    type: 'vehicle',
    label: 'Truck',
    x: 448,
    yStart: 118,
    drift: 16,
    width: 42,
    height: 68,
    risk: 'medium',
  },
  {
    id: 'ped-01',
    type: 'pedestrian',
    label: 'Pedestrian',
    x: 548,
    yStart: 190,
    drift: 34,
    width: 22,
    height: 22,
    risk: 'high',
  },
  {
    id: 'cone-01',
    type: 'cone',
    label: 'Cone',
    x: 328,
    yStart: 230,
    drift: -8,
    width: 18,
    height: 18,
    risk: 'low',
  },
  {
    id: 'barrier-01',
    type: 'barrier',
    label: 'Barrier',
    x: 278,
    yStart: 132,
    drift: 20,
    width: 54,
    height: 18,
    risk: 'medium',
  },
  {
    id: 'veh-02',
    type: 'vehicle',
    label: 'Sedan',
    x: 360,
    yStart: 74,
    drift: 26,
    width: 36,
    height: 60,
    risk: 'low',
  },
  {
    id: 'cone-02',
    type: 'cone',
    label: 'Cone',
    x: 604,
    yStart: 280,
    drift: -18,
    width: 18,
    height: 18,
    risk: 'low',
  },
];

export function createWebvizReplay(): WebvizReplay {
  const frames = Array.from({ length: 7 }, (_, index): ReplayFrame => {
    const progress = index / 6;
    const ego: EgoPose = {
      x: 460 + Math.sin(progress * Math.PI) * 14,
      y: 350 - progress * 112,
      headingDeg: -2 + progress * 5,
      speedKph: 28 + Math.round(progress * 18),
    };

    const obstacles = BASE_OBSTACLES.map(({ yStart, drift, ...obstacle }) => ({
      ...obstacle,
      x: obstacle.x + Math.sin(progress * Math.PI * 2 + obstacle.x) * 5,
      y: yStart + drift * progress + Math.cos(progress * Math.PI + obstacle.x) * 4,
    }));

    return {
      timeMs: index * 1000,
      ego,
      obstacles,
      lidarPoints: buildLidarPoints(index, ego, obstacles),
      cameraSnapshots: buildCameraSnapshots(index),
    };
  });

  return {
    durationMs: frames[frames.length - 1]?.timeMs ?? 0,
    roadWidth: 340,
    laneCenterX: 460,
    buildings: BUILDINGS,
    cameraFeeds: CAMERA_FEEDS,
    frames,
  };
}

export function frameAtTime(replay: WebvizReplay, timeMs: number): ReplayFrame {
  if (replay.frames.length === 0) {
    throw new Error('WebViz replay contains no frames');
  }

  const clampedTime = Math.min(Math.max(timeMs, 0), replay.durationMs);

  return replay.frames.reduce((closest, frame) => {
    const closestDelta = Math.abs(closest.timeMs - clampedTime);
    const frameDelta = Math.abs(frame.timeMs - clampedTime);
    return frameDelta < closestDelta ? frame : closest;
  }, replay.frames[0]);
}

export function playbackSummary(replay: WebvizReplay): PlaybackSummary {
  return {
    totalFrames: replay.frames.length,
    maxLidarPoints: Math.max(...replay.frames.map((frame) => frame.lidarPoints.length), 0),
    cameraCount: replay.cameraFeeds.length,
    obstacleCount: Math.max(...replay.frames.map((frame) => frame.obstacles.length), 0),
  };
}

function buildLidarPoints(frameIndex: number, ego: EgoPose, obstacles: Obstacle[]): LidarPoint[] {
  const ringPoints = Array.from({ length: 36 }, (_, pointIndex): LidarPoint => {
    const angle = (pointIndex / 36) * Math.PI * 2 + frameIndex * 0.08;
    const radius = 44 + (pointIndex % 6) * 15 + (frameIndex % 3) * 4;
    return {
      id: `ring-${frameIndex}-${pointIndex}`,
      x: ego.x + Math.cos(angle) * radius,
      y: ego.y + Math.sin(angle) * radius * 0.72,
      intensity: 0.35 + (pointIndex % 5) * 0.12,
    };
  });

  const obstacleReturns = obstacles.flatMap((obstacle, obstacleIndex) =>
    Array.from({ length: 5 }, (_, returnIndex): LidarPoint => ({
      id: `obs-${frameIndex}-${obstacle.id}-${returnIndex}`,
      x: obstacle.x + (returnIndex - 2) * (obstacle.width / 5),
      y: obstacle.y + Math.sin(returnIndex + obstacleIndex) * (obstacle.height / 3),
      intensity: obstacle.risk === 'high' ? 0.95 : 0.62,
    })),
  );

  return [...ringPoints, ...obstacleReturns];
}

function buildCameraSnapshots(frameIndex: number): Record<CameraFeed['id'], CameraSnapshot> {
  const frontAlert = frameIndex >= 3 ? 'pedestrianCrosswalk' : undefined;

  return {
    front: {
      labelKey: 'frontRoad',
      descriptionKey: frameIndex >= 3 ? 'frontPedestrian' : 'frontClear',
      alertKey: frontAlert,
    },
    left: {
      labelKey: 'leftCurb',
      descriptionKey: 'leftCurb',
    },
    right: {
      labelKey: 'rightCurb',
      descriptionKey: frameIndex >= 2 ? 'rightPedestrian' : 'rightStation',
      alertKey: frameIndex >= 2 ? 'vruCandidate' : undefined,
    },
    rear: {
      labelKey: 'rearRoad',
      descriptionKey: 'rearRoad',
    },
  };
}
