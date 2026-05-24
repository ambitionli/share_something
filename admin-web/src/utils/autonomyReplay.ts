export type LaneSide = 'left' | 'right' | 'center';

export type SceneObjectKind = 'vehicle' | 'pedestrian' | 'cone' | 'barrier' | 'cyclist';

export type SceneObjectLabelKey = 'leadCar' | 'roadCone' | 'pedestrian' | 'workZoneBarrier' | 'cyclist';

export type CameraNameKey = 'frontWide' | 'frontNarrow' | 'leftSide' | 'rightSide';

export interface SceneObject {
  id: string;
  kind: SceneObjectKind;
  labelKey: SceneObjectLabelKey;
  x: number;
  y: number;
  side: LaneSide;
  risk: 'low' | 'medium' | 'high';
}

export interface LidarCluster {
  id: string;
  objectId: string;
  x: number;
  y: number;
  radius: number;
  pointCount: number;
  intensity: number;
}

export interface LidarPoint {
  id: string;
  x: number;
  y: number;
  intensity: number;
}

export interface VehiclePose {
  x: number;
  y: number;
  headingDeg: number;
  speedKph: number;
}

export interface ReplayFrame {
  timestamp: number;
  vehicle: VehiclePose;
  obstacles: SceneObject[];
  lidarClusters: LidarCluster[];
}

export interface CameraFeed {
  id: string;
  nameKey: CameraNameKey;
  direction: 'front' | 'rear' | 'left' | 'right';
}

export interface AutonomyReplay {
  duration: number;
  cameras: CameraFeed[];
  frames: ReplayFrame[];
}

export interface SceneSummary {
  activeObstacleCount: number;
  totalPointCount: number;
  cameraCount: number;
}

const cameras: CameraFeed[] = [
  { id: 'front-wide', nameKey: 'frontWide', direction: 'front' },
  { id: 'front-narrow', nameKey: 'frontNarrow', direction: 'front' },
  { id: 'left-side', nameKey: 'leftSide', direction: 'left' },
  { id: 'right-side', nameKey: 'rightSide', direction: 'right' },
];

export const autonomyReplay: AutonomyReplay = {
  duration: 6,
  cameras,
  frames: [
    {
      timestamp: 0,
      vehicle: { x: 0, y: 0, headingDeg: 0, speedKph: 18 },
      obstacles: [
        { id: 'lead-car', kind: 'vehicle', labelKey: 'leadCar', x: 0.8, y: 35, side: 'center', risk: 'medium' },
        { id: 'left-cone', kind: 'cone', labelKey: 'roadCone', x: -5.2, y: 18, side: 'left', risk: 'low' },
        { id: 'right-ped', kind: 'pedestrian', labelKey: 'pedestrian', x: 6.4, y: 42, side: 'right', risk: 'high' },
      ],
      lidarClusters: [
        { id: 'pc-lead-car-0', objectId: 'lead-car', x: 0.8, y: 35, radius: 3.8, pointCount: 52, intensity: 0.82 },
        { id: 'pc-left-cone-0', objectId: 'left-cone', x: -5.2, y: 18, radius: 1.4, pointCount: 24, intensity: 0.68 },
        { id: 'pc-right-ped-0', objectId: 'right-ped', x: 6.4, y: 42, radius: 1.8, pointCount: 38, intensity: 0.91 },
      ],
    },
    {
      timestamp: 1.2,
      vehicle: { x: 0.2, y: 14, headingDeg: 1.5, speedKph: 26 },
      obstacles: [
        { id: 'lead-car', kind: 'vehicle', labelKey: 'leadCar', x: 1, y: 48, side: 'center', risk: 'medium' },
        { id: 'left-cone', kind: 'cone', labelKey: 'roadCone', x: -5.5, y: 31, side: 'left', risk: 'low' },
        { id: 'right-ped', kind: 'pedestrian', labelKey: 'pedestrian', x: 6.1, y: 53, side: 'right', risk: 'high' },
        { id: 'right-barrier', kind: 'barrier', labelKey: 'workZoneBarrier', x: 5.4, y: 25, side: 'right', risk: 'medium' },
      ],
      lidarClusters: [
        { id: 'pc-lead-car-1', objectId: 'lead-car', x: 1, y: 48, radius: 3.9, pointCount: 58, intensity: 0.84 },
        { id: 'pc-left-cone-1', objectId: 'left-cone', x: -5.5, y: 31, radius: 1.4, pointCount: 27, intensity: 0.7 },
        { id: 'pc-right-ped-1', objectId: 'right-ped', x: 6.1, y: 53, radius: 1.9, pointCount: 41, intensity: 0.92 },
        { id: 'pc-right-barrier-1', objectId: 'right-barrier', x: 5.4, y: 25, radius: 2.6, pointCount: 36, intensity: 0.76 },
      ],
    },
    {
      timestamp: 2.4,
      vehicle: { x: -0.2, y: 30, headingDeg: -1, speedKph: 31 },
      obstacles: [
        { id: 'lead-car', kind: 'vehicle', labelKey: 'leadCar', x: 0.6, y: 63, side: 'center', risk: 'medium' },
        { id: 'left-cone', kind: 'cone', labelKey: 'roadCone', x: -5.1, y: 43, side: 'left', risk: 'low' },
        { id: 'right-ped', kind: 'pedestrian', labelKey: 'pedestrian', x: 5.8, y: 62, side: 'right', risk: 'high' },
        { id: 'right-barrier', kind: 'barrier', labelKey: 'workZoneBarrier', x: 5.6, y: 39, side: 'right', risk: 'medium' },
      ],
      lidarClusters: [
        { id: 'pc-lead-car-2', objectId: 'lead-car', x: 0.6, y: 63, radius: 4, pointCount: 61, intensity: 0.85 },
        { id: 'pc-left-cone-2', objectId: 'left-cone', x: -5.1, y: 43, radius: 1.5, pointCount: 30, intensity: 0.72 },
        { id: 'pc-right-ped-2', objectId: 'right-ped', x: 5.8, y: 62, radius: 2, pointCount: 44, intensity: 0.93 },
        { id: 'pc-right-barrier-2', objectId: 'right-barrier', x: 5.6, y: 39, radius: 2.7, pointCount: 39, intensity: 0.77 },
      ],
    },
    {
      timestamp: 3.6,
      vehicle: { x: 0.3, y: 45, headingDeg: 0.5, speedKph: 34 },
      obstacles: [
        { id: 'lead-car', kind: 'vehicle', labelKey: 'leadCar', x: 0.9, y: 78, side: 'center', risk: 'medium' },
        { id: 'left-cone', kind: 'cone', labelKey: 'roadCone', x: -5.3, y: 59, side: 'left', risk: 'low' },
        { id: 'right-ped', kind: 'pedestrian', labelKey: 'pedestrian', x: 5.3, y: 73, side: 'right', risk: 'high' },
        { id: 'right-barrier', kind: 'barrier', labelKey: 'workZoneBarrier', x: 5.7, y: 54, side: 'right', risk: 'medium' },
        { id: 'left-cyclist', kind: 'cyclist', labelKey: 'cyclist', x: -4.4, y: 70, side: 'left', risk: 'medium' },
      ],
      lidarClusters: [
        { id: 'pc-lead-car-3', objectId: 'lead-car', x: 0.9, y: 78, radius: 4.2, pointCount: 63, intensity: 0.86 },
        { id: 'pc-left-cone-3', objectId: 'left-cone', x: -5.3, y: 59, radius: 1.5, pointCount: 31, intensity: 0.72 },
        { id: 'pc-right-ped-3', objectId: 'right-ped', x: 5.3, y: 73, radius: 2, pointCount: 45, intensity: 0.94 },
        { id: 'pc-right-barrier-3', objectId: 'right-barrier', x: 5.7, y: 54, radius: 2.7, pointCount: 40, intensity: 0.77 },
        { id: 'pc-left-cyclist-3', objectId: 'left-cyclist', x: -4.4, y: 70, radius: 2.3, pointCount: 34, intensity: 0.8 },
      ],
    },
    {
      timestamp: 4.8,
      vehicle: { x: -0.1, y: 61, headingDeg: -0.7, speedKph: 29 },
      obstacles: [
        { id: 'lead-car', kind: 'vehicle', labelKey: 'leadCar', x: 0.4, y: 93, side: 'center', risk: 'medium' },
        { id: 'left-cone', kind: 'cone', labelKey: 'roadCone', x: -5.4, y: 75, side: 'left', risk: 'low' },
        { id: 'right-ped', kind: 'pedestrian', labelKey: 'pedestrian', x: 5, y: 84, side: 'right', risk: 'high' },
        { id: 'right-barrier', kind: 'barrier', labelKey: 'workZoneBarrier', x: 5.8, y: 70, side: 'right', risk: 'medium' },
        { id: 'left-cyclist', kind: 'cyclist', labelKey: 'cyclist', x: -4.1, y: 86, side: 'left', risk: 'medium' },
      ],
      lidarClusters: [
        { id: 'pc-lead-car-4', objectId: 'lead-car', x: 0.4, y: 93, radius: 4.2, pointCount: 64, intensity: 0.87 },
        { id: 'pc-left-cone-4', objectId: 'left-cone', x: -5.4, y: 75, radius: 1.6, pointCount: 31, intensity: 0.73 },
        { id: 'pc-right-ped-4', objectId: 'right-ped', x: 5, y: 84, radius: 2, pointCount: 46, intensity: 0.94 },
        { id: 'pc-right-barrier-4', objectId: 'right-barrier', x: 5.8, y: 70, radius: 2.8, pointCount: 41, intensity: 0.78 },
        { id: 'pc-left-cyclist-4', objectId: 'left-cyclist', x: -4.1, y: 86, radius: 2.4, pointCount: 34, intensity: 0.81 },
      ],
    },
    {
      timestamp: 6,
      vehicle: { x: 0.1, y: 76, headingDeg: 0.2, speedKph: 24 },
      obstacles: [
        { id: 'lead-car', kind: 'vehicle', labelKey: 'leadCar', x: 0.5, y: 108, side: 'center', risk: 'low' },
        { id: 'right-ped', kind: 'pedestrian', labelKey: 'pedestrian', x: 4.7, y: 97, side: 'right', risk: 'medium' },
        { id: 'right-barrier', kind: 'barrier', labelKey: 'workZoneBarrier', x: 5.9, y: 85, side: 'right', risk: 'medium' },
        { id: 'left-cyclist', kind: 'cyclist', labelKey: 'cyclist', x: -3.8, y: 101, side: 'left', risk: 'medium' },
      ],
      lidarClusters: [
        { id: 'pc-lead-car-5', objectId: 'lead-car', x: 0.5, y: 108, radius: 4.1, pointCount: 60, intensity: 0.84 },
        { id: 'pc-right-ped-5', objectId: 'right-ped', x: 4.7, y: 97, radius: 2, pointCount: 43, intensity: 0.9 },
        { id: 'pc-right-barrier-5', objectId: 'right-barrier', x: 5.9, y: 85, radius: 2.8, pointCount: 40, intensity: 0.77 },
        { id: 'pc-left-cyclist-5', objectId: 'left-cyclist', x: -3.8, y: 101, radius: 2.4, pointCount: 35, intensity: 0.8 },
      ],
    },
  ],
};

export function getFrameAtTime(replay: AutonomyReplay, requestedTime: number): ReplayFrame {
  if (replay.frames.length === 0) {
    throw new Error('Autonomy replay has no frames');
  }

  if (requestedTime <= replay.frames[0].timestamp) {
    return replay.frames[0];
  }

  const lastFrame = replay.frames[replay.frames.length - 1];
  if (requestedTime >= lastFrame.timestamp) {
    return lastFrame;
  }

  for (let index = replay.frames.length - 1; index >= 0; index -= 1) {
    const frame = replay.frames[index];
    if (frame.timestamp <= requestedTime) {
      return frame;
    }
  }

  return replay.frames[0];
}

export function getSceneSummary(replay: AutonomyReplay, frame: ReplayFrame): SceneSummary {
  return {
    activeObstacleCount: frame.obstacles.length,
    totalPointCount: frame.lidarClusters.reduce((sum, cluster) => sum + cluster.pointCount, 0),
    cameraCount: replay.cameras.length,
  };
}

export function formatReplayTime(seconds: number): string {
  return `${seconds.toFixed(1)}s`;
}

export function buildLidarPoints(frame: ReplayFrame): LidarPoint[] {
  return frame.lidarClusters.flatMap((cluster) =>
    Array.from({ length: cluster.pointCount }, (_, pointIndex) => {
      const angle = (pointIndex / cluster.pointCount) * Math.PI * 2;
      const ring = pointIndex % 5;
      const radius = cluster.radius * (1 - ring * 0.12);

      return {
        id: `${cluster.id}-${pointIndex}`,
        x: Number((cluster.x + Math.cos(angle) * radius).toFixed(1)),
        y: Number((cluster.y + Math.sin(angle) * radius).toFixed(1)),
        intensity: cluster.intensity,
      };
    }),
  );
}
