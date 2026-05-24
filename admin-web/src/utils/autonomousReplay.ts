export type ObstacleRisk = 'danger' | 'watch' | 'clear';

export type ObstacleKind = 'vehicle' | 'pedestrian' | 'cone' | 'barrier';

export type CameraDirection = 'front' | 'left' | 'right' | 'rear';

export interface LidarPoint {
  x: number;
  y: number;
  z: number;
  intensity: number;
}

export interface Obstacle {
  id: string;
  kind: ObstacleKind;
  label: string;
  distanceMeters: number;
  laneOffsetMeters: number;
  velocityKph: number;
}

export interface CameraFeed {
  direction: CameraDirection;
  label: string;
  exposure: string;
  detectedObjects: string[];
}

export interface ReplayFrame {
  id: string;
  timestampSeconds: number;
  speedKph: number;
  steeringDeg: number;
  egoPose: {
    x: number;
    y: number;
    headingDeg: number;
  };
  lidarPoints: LidarPoint[];
  obstacles: Obstacle[];
  cameraFeeds: CameraFeed[];
}

export interface PointCloudSummary {
  total: number;
  nearField: number;
  highIntensity: number;
}

const cameraFeeds: CameraFeed[] = [
  { direction: 'front', label: 'Front Camera', exposure: 'HDR 32ms', detectedObjects: ['lead car', 'traffic cone'] },
  { direction: 'left', label: 'Left Camera', exposure: 'Auto 28ms', detectedObjects: ['building facade', 'parking vehicle'] },
  { direction: 'right', label: 'Right Camera', exposure: 'Auto 30ms', detectedObjects: ['pedestrian', 'road sign'] },
  { direction: 'rear', label: 'Rear Camera', exposure: 'HDR 34ms', detectedObjects: ['following car', 'lane marker'] },
];

function buildPointCloud(frameOffset: number): LidarPoint[] {
  return Array.from({ length: 56 }, (_, index) => {
    const ring = index % 14;
    const scan = Math.floor(index / 14);
    const lateralWave = Math.sin((index + frameOffset) * 0.62);
    const forward = 6 + ring * 2.9 + frameOffset * 1.4;

    return {
      x: forward,
      y: (scan - 1.5) * 3.6 + lateralWave * 1.2,
      z: 0.15 + (ring % 4) * 0.18,
      intensity: Number((0.35 + ((index + frameOffset * 3) % 10) * 0.065).toFixed(2)),
    };
  });
}

export const replayFrames: ReplayFrame[] = [
  {
    id: 'frame-001',
    timestampSeconds: 0,
    speedKph: 18,
    steeringDeg: 0,
    egoPose: { x: 0, y: 0, headingDeg: 0 },
    lidarPoints: buildPointCloud(0),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', label: 'Lead vehicle', distanceMeters: 24, laneOffsetMeters: 0.3, velocityKph: 16 },
      { id: 'obs-cone-right', kind: 'cone', label: 'Construction cone', distanceMeters: 13, laneOffsetMeters: 2.4, velocityKph: 0 },
      { id: 'obs-ped-left', kind: 'pedestrian', label: 'Pedestrian', distanceMeters: 18, laneOffsetMeters: -3.2, velocityKph: 4 },
    ],
    cameraFeeds,
  },
  {
    id: 'frame-002',
    timestampSeconds: 2.4,
    speedKph: 22,
    steeringDeg: -2,
    egoPose: { x: 18, y: -0.2, headingDeg: -1 },
    lidarPoints: buildPointCloud(1),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', label: 'Lead vehicle', distanceMeters: 19, laneOffsetMeters: 0.2, velocityKph: 15 },
      { id: 'obs-cone-right', kind: 'cone', label: 'Construction cone', distanceMeters: 8, laneOffsetMeters: 2.2, velocityKph: 0 },
      { id: 'obs-barrier', kind: 'barrier', label: 'Road barrier', distanceMeters: 16, laneOffsetMeters: 3.4, velocityKph: 0 },
    ],
    cameraFeeds,
  },
  {
    id: 'frame-003',
    timestampSeconds: 4.8,
    speedKph: 24,
    steeringDeg: 3,
    egoPose: { x: 36, y: 0.1, headingDeg: 2 },
    lidarPoints: buildPointCloud(2),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', label: 'Lead vehicle', distanceMeters: 15, laneOffsetMeters: 0.1, velocityKph: 17 },
      { id: 'obs-ped-right', kind: 'pedestrian', label: 'Pedestrian crossing', distanceMeters: 6, laneOffsetMeters: 1.8, velocityKph: 5 },
      { id: 'obs-parked-left', kind: 'vehicle', label: 'Parked vehicle', distanceMeters: 21, laneOffsetMeters: -3.1, velocityKph: 0 },
    ],
    cameraFeeds,
  },
  {
    id: 'frame-004',
    timestampSeconds: 7.2,
    speedKph: 20,
    steeringDeg: 1,
    egoPose: { x: 54, y: 0, headingDeg: 1 },
    lidarPoints: buildPointCloud(3),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', label: 'Lead vehicle', distanceMeters: 22, laneOffsetMeters: 0.4, velocityKph: 20 },
      { id: 'obs-barrier', kind: 'barrier', label: 'Road barrier', distanceMeters: 10, laneOffsetMeters: 3, velocityKph: 0 },
      { id: 'obs-cone-left', kind: 'cone', label: 'Lane cone', distanceMeters: 12, laneOffsetMeters: -2.2, velocityKph: 0 },
    ],
    cameraFeeds,
  },
];

export function getReplayFrame(frames: readonly ReplayFrame[], index: number): ReplayFrame {
  if (frames.length === 0) {
    throw new Error('Cannot read replay frame from an empty dataset.');
  }

  const boundedIndex = Math.min(Math.max(Math.trunc(index), 0), frames.length - 1);
  return frames[boundedIndex];
}

export function formatPlaybackTime(seconds: number): string {
  const totalTenths = Math.max(0, Math.round(seconds * 10));
  const minutes = Math.floor(totalTenths / 600);
  const remainingSeconds = Math.floor(totalTenths / 10) % 60;
  const tenths = totalTenths % 10;

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}.${tenths}`;
}

export function summarizePointCloud(points: readonly LidarPoint[]): PointCloudSummary {
  return points.reduce<PointCloudSummary>(
    (summary, point) => {
      const distance = Math.hypot(point.x, point.y);

      return {
        total: summary.total + 1,
        nearField: summary.nearField + (distance <= 5 ? 1 : 0),
        highIntensity: summary.highIntensity + (point.intensity >= 0.8 ? 1 : 0),
      };
    },
    { total: 0, nearField: 0, highIntensity: 0 },
  );
}

export function classifyObstacleRisk(distanceMeters: number): ObstacleRisk {
  if (distanceMeters <= 8) {
    return 'danger';
  }

  if (distanceMeters <= 18) {
    return 'watch';
  }

  return 'clear';
}
