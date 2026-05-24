export type ObstacleRisk = 'danger' | 'watch' | 'clear';

export type ObstacleKind = 'vehicle' | 'pedestrian' | 'cone' | 'barrier';

export type ObstacleId =
  | 'obs-lead-car'
  | 'obs-cone-right'
  | 'obs-ped-left'
  | 'obs-barrier'
  | 'obs-ped-right'
  | 'obs-parked-left'
  | 'obs-cone-left';

export type CameraDirection = 'front' | 'left' | 'right' | 'rear';

export type CameraObjectKey =
  | 'leadCar'
  | 'trafficCone'
  | 'buildingFacade'
  | 'parkingVehicle'
  | 'pedestrian'
  | 'roadSign'
  | 'followingCar'
  | 'laneMarker'
  | 'roadBarrier'
  | 'laneCone';

export interface LidarPoint {
  x: number;
  y: number;
  z: number;
  intensity: number;
}

export interface Obstacle {
  id: ObstacleId;
  kind: ObstacleKind;
  distanceMeters: number;
  laneOffsetMeters: number;
  velocityKph: number;
}

export interface CameraFeed {
  direction: CameraDirection;
  exposure: string;
  sceneShift: number;
  detectedObjectKeys: CameraObjectKey[];
}

export interface RadarDetection {
  id: string;
  rangeMeters: number;
  azimuthDeg: number;
  relativeVelocityKph: number;
  confidence: number;
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
  radarDetections: RadarDetection[];
  obstacles: Obstacle[];
  cameraFeeds: CameraFeed[];
}

export interface PointCloudSummary {
  total: number;
  nearField: number;
  highIntensity: number;
}

export interface RadarSummary {
  total: number;
  approaching: number;
  closestRangeMeters: number;
}

function buildCameraFeeds(frameOffset: number): CameraFeed[] {
  const objectFrames: CameraObjectKey[][] = [
    ['leadCar', 'trafficCone'],
    ['buildingFacade', 'parkingVehicle'],
    ['pedestrian', 'roadSign'],
    ['followingCar', 'laneMarker'],
  ];

  return [
    { direction: 'front', exposure: `HDR ${32 + frameOffset * 2}ms`, sceneShift: frameOffset * 8, detectedObjectKeys: objectFrames[(frameOffset + 0) % objectFrames.length] },
    { direction: 'left', exposure: `Auto ${28 + frameOffset}ms`, sceneShift: frameOffset * 11 + 5, detectedObjectKeys: objectFrames[(frameOffset + 1) % objectFrames.length] },
    { direction: 'right', exposure: `Auto ${30 + frameOffset}ms`, sceneShift: frameOffset * 9 + 10, detectedObjectKeys: objectFrames[(frameOffset + 2) % objectFrames.length] },
    { direction: 'rear', exposure: `HDR ${34 + frameOffset * 2}ms`, sceneShift: frameOffset * 7 + 15, detectedObjectKeys: objectFrames[(frameOffset + 3) % objectFrames.length] },
  ];
}

function buildRadarDetections(frameOffset: number): RadarDetection[] {
  return [
    {
      id: 'radar-lead-car',
      rangeMeters: 28 - frameOffset * 3,
      azimuthDeg: 1 + frameOffset * 0.4,
      relativeVelocityKph: -4 + frameOffset,
      confidence: 0.91,
    },
    {
      id: 'radar-right-obstacle',
      rangeMeters: 18 - frameOffset * 2,
      azimuthDeg: 16 - frameOffset,
      relativeVelocityKph: -1,
      confidence: 0.84,
    },
    {
      id: 'radar-left-parked',
      rangeMeters: 34 + frameOffset,
      azimuthDeg: -21 + frameOffset * 0.8,
      relativeVelocityKph: 0,
      confidence: 0.78,
    },
  ];
}

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
    radarDetections: buildRadarDetections(0),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', distanceMeters: 24, laneOffsetMeters: 0.3, velocityKph: 16 },
      { id: 'obs-cone-right', kind: 'cone', distanceMeters: 13, laneOffsetMeters: 2.4, velocityKph: 0 },
      { id: 'obs-ped-left', kind: 'pedestrian', distanceMeters: 18, laneOffsetMeters: -3.2, velocityKph: 4 },
    ],
    cameraFeeds: buildCameraFeeds(0),
  },
  {
    id: 'frame-002',
    timestampSeconds: 2.4,
    speedKph: 22,
    steeringDeg: -2,
    egoPose: { x: 18, y: -0.2, headingDeg: -1 },
    lidarPoints: buildPointCloud(1),
    radarDetections: buildRadarDetections(1),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', distanceMeters: 19, laneOffsetMeters: 0.2, velocityKph: 15 },
      { id: 'obs-cone-right', kind: 'cone', distanceMeters: 8, laneOffsetMeters: 2.2, velocityKph: 0 },
      { id: 'obs-barrier', kind: 'barrier', distanceMeters: 16, laneOffsetMeters: 3.4, velocityKph: 0 },
    ],
    cameraFeeds: buildCameraFeeds(1),
  },
  {
    id: 'frame-003',
    timestampSeconds: 4.8,
    speedKph: 24,
    steeringDeg: 3,
    egoPose: { x: 36, y: 0.1, headingDeg: 2 },
    lidarPoints: buildPointCloud(2),
    radarDetections: buildRadarDetections(2),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', distanceMeters: 15, laneOffsetMeters: 0.1, velocityKph: 17 },
      { id: 'obs-ped-right', kind: 'pedestrian', distanceMeters: 6, laneOffsetMeters: 1.8, velocityKph: 5 },
      { id: 'obs-parked-left', kind: 'vehicle', distanceMeters: 21, laneOffsetMeters: -3.1, velocityKph: 0 },
    ],
    cameraFeeds: buildCameraFeeds(2),
  },
  {
    id: 'frame-004',
    timestampSeconds: 7.2,
    speedKph: 20,
    steeringDeg: 1,
    egoPose: { x: 54, y: 0, headingDeg: 1 },
    lidarPoints: buildPointCloud(3),
    radarDetections: buildRadarDetections(3),
    obstacles: [
      { id: 'obs-lead-car', kind: 'vehicle', distanceMeters: 22, laneOffsetMeters: 0.4, velocityKph: 20 },
      { id: 'obs-barrier', kind: 'barrier', distanceMeters: 10, laneOffsetMeters: 3, velocityKph: 0 },
      { id: 'obs-cone-left', kind: 'cone', distanceMeters: 12, laneOffsetMeters: -2.2, velocityKph: 0 },
    ],
    cameraFeeds: buildCameraFeeds(3),
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

export function summarizeRadarDetections(detections: readonly RadarDetection[]): RadarSummary {
  if (detections.length === 0) {
    return { total: 0, approaching: 0, closestRangeMeters: 0 };
  }

  return detections.reduce<RadarSummary>(
    (summary, detection) => ({
      total: summary.total + 1,
      approaching: summary.approaching + (detection.relativeVelocityKph < 0 ? 1 : 0),
      closestRangeMeters: Math.min(summary.closestRangeMeters, detection.rangeMeters),
    }),
    { total: 0, approaching: 0, closestRangeMeters: Number.POSITIVE_INFINITY },
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
