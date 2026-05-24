import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Slider,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  AimOutlined,
  CarOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RadarChartOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  autonomousReplayScenario,
  getReplayFrame,
  getReplayStats,
} from '../utils/autonomousReplay';
import type { BuildingModel, ObstacleModel, ReplayFrame } from '../utils/autonomousReplay';

const { Text, Title } = Typography;

const surfaceStyle: CSSProperties = {
  borderRadius: 20,
  background: 'linear-gradient(180deg, #0f172a 0%, #111827 45%, #020617 100%)',
  color: '#e5e7eb',
  overflow: 'hidden',
};

const riskColor: Record<ObstacleModel['risk'], string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

function formatTimestamp(timestampMs: number): string {
  return `${(timestampMs / 1000).toFixed(1)}s`;
}

function yToView(relativeY: number): number {
  return 410 - relativeY * 7.2;
}

function xToView(x: number): number {
  return 260 + x * 18;
}

function buildingRect(building: BuildingModel, frame: ReplayFrame) {
  const relativeY = building.worldY - frame.ego.worldY;
  const width = building.width * 5;
  const height = building.height * 1.2;
  const x = building.side === 'left' ? 18 : 502 - width;

  return {
    x,
    y: yToView(relativeY) - height / 2,
    width,
    height,
  };
}

function BirdseyeScene({ frame }: { frame: ReplayFrame }) {
  const { t } = useTranslation();
  const visibleBuildings = autonomousReplayScenario.buildings.filter((building) => {
    const relativeY = building.worldY - frame.ego.worldY;
    return relativeY > -24 && relativeY < 58;
  });
  const obstacleShortLabels: Record<ObstacleModel['type'], string> = {
    vehicle: t('webviz.obstacleShortVehicle'),
    pedestrian: t('webviz.obstacleShortPedestrian'),
    cone: t('webviz.obstacleShortCone'),
    barrier: t('webviz.obstacleShortBarrier'),
    cyclist: t('webviz.obstacleShortCyclist'),
  };

  return (
    <Card
      title={
        <Space>
          <RadarChartOutlined />
          <span>{t('webviz.bevTitle')}</span>
          <Tag color="cyan">{formatTimestamp(frame.timestampMs)}</Tag>
        </Space>
      }
      styles={{ body: { padding: 0 } }}
    >
      <div style={surfaceStyle}>
        <svg viewBox="0 0 520 460" role="img" aria-label={t('webviz.bevAria')}>
          <defs>
            <linearGradient id="roadGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="520" height="460" fill="#020617" />
          <rect x="118" y="0" width="284" height="460" fill="url(#roadGradient)" />
          <rect x="112" y="0" width="6" height="460" fill="#f8fafc" opacity="0.6" />
          <rect x="402" y="0" width="6" height="460" fill="#f8fafc" opacity="0.6" />

          {[189, 260, 331].map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="460"
              stroke="#e2e8f0"
              strokeDasharray="18 18"
              strokeWidth="3"
              opacity="0.55"
            />
          ))}

          {visibleBuildings.map((building) => {
            const rect = buildingRect(building, frame);

            return (
              <g key={building.id}>
                <rect
                  {...rect}
                  rx="8"
                  fill={building.color}
                  opacity="0.9"
                  stroke="#cbd5e1"
                  strokeOpacity="0.24"
                />
                <text
                  x={rect.x + rect.width / 2}
                  y={rect.y + 22}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="11"
                >
                  {t('webviz.building')}
                </text>
              </g>
            );
          })}

          {frame.lidarPoints.map((point) => (
            <circle
              key={point.id}
              cx={xToView(point.x)}
              cy={yToView(point.y)}
              r={point.source === 'obstacle' ? 3.2 : 2}
              fill={point.source === 'obstacle' ? '#f97316' : '#67e8f9'}
              opacity={Math.min(point.intensity, 0.96)}
              filter={point.source === 'obstacle' ? 'url(#glow)' : undefined}
            />
          ))}

          {frame.radarDetections.map((detection) => {
            const angleRadians = detection.angleDegrees * (Math.PI / 180);
            const originX = xToView(frame.ego.x);
            const originY = 410;
            const x = originX + Math.sin(angleRadians) * detection.rangeMeters * 18;
            const y = originY - Math.cos(angleRadians) * detection.rangeMeters * 7.2;

            return (
              <g key={detection.id}>
                <line x1={originX} y1={originY} x2={x} y2={y} stroke="#facc15" strokeWidth="1.5" opacity="0.38" />
                <circle cx={x} cy={y} r="7" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.9" />
                <circle cx={x} cy={y} r="2.5" fill="#facc15" />
              </g>
            );
          })}

          {frame.visibleObstacles.map((obstacle) => {
            const relativeY = obstacle.worldY - frame.ego.worldY;
            const x = xToView(obstacle.x);
            const y = yToView(relativeY);

            return (
              <g key={obstacle.id}>
                <rect
                  x={x - obstacle.width * 9}
                  y={y - obstacle.length * 6}
                  width={obstacle.width * 18}
                  height={Math.max(obstacle.length * 12, 18)}
                  rx="6"
                  fill={riskColor[obstacle.risk]}
                  opacity="0.88"
                  stroke="#fff7ed"
                  strokeWidth="1.5"
                />
                <text x={x} y={y + 4} textAnchor="middle" fill="#111827" fontSize="10" fontWeight="700">
                  {obstacleShortLabels[obstacle.type]}
                </text>
              </g>
            );
          })}

          <g transform={`translate(${xToView(frame.ego.x)} 410) rotate(${frame.ego.headingDegrees})`}>
            <path d="M0 -30 L17 18 L0 28 L-17 18 Z" fill="#6366f1" stroke="#eef2ff" strokeWidth="2" />
            <circle cx="0" cy="-4" r="48" fill="none" stroke="#818cf8" strokeDasharray="6 8" opacity="0.45" />
            <text x="0" y="48" textAnchor="middle" fill="#c7d2fe" fontSize="12">
              {t('webviz.ego')}
            </text>
          </g>
        </svg>
      </div>
    </Card>
  );
}

function CameraPanel({ feedIndex, frame }: { feedIndex: number; frame: ReplayFrame }) {
  const { t } = useTranslation();
  const feed = frame.cameraFeeds[feedIndex];
  const tint = ['#38bdf8', '#a78bfa', '#34d399', '#f97316'][feedIndex];
  const cameraTitles = {
    front: t('webviz.cameraFront'),
    left: t('webviz.cameraLeft'),
    right: t('webviz.cameraRight'),
    rear: t('webviz.cameraRear'),
  };
  const obstacleLabels: Record<string, string> = {
    'obs-sedan': t('webviz.obstacleSedan'),
    'obs-pedestrian': t('webviz.obstaclePedestrian'),
    'obs-cones': t('webviz.obstacleCones'),
    'obs-barrier': t('webviz.obstacleBarrier'),
    'obs-cyclist': t('webviz.obstacleCyclist'),
  };
  const cameraConfig = autonomousReplayScenario.cameras.find((camera) => camera.id === feed.cameraId);
  const frameBadge = `${t('webviz.frame')} ${String(frame.frameIndex + 1).padStart(2, '0')} | ${t('webviz.fov')} ${cameraConfig?.fovDegrees ?? 0}${t('webviz.degreeUnit')}`;

  return (
    <Card
      size="small"
      title={
        <Space>
          <VideoCameraOutlined />
          <span>{cameraTitles[feed.cameraId]}</span>
        </Space>
      }
      extra={<Badge status="processing" text={t('webviz.recording')} />}
    >
      <div
        style={{
          height: 150,
          borderRadius: 14,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.9) 100%), linear-gradient(120deg, #1e293b, #020617)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '55% 20% -15% 20%',
            transform: 'perspective(160px) rotateX(58deg)',
            transformOrigin: 'top center',
            background: `linear-gradient(90deg, transparent 0 48%, ${tint} 49% 51%, transparent 52% 100%)`,
            opacity: 0.8,
          }}
        />
        <div style={{ position: 'absolute', left: 18, top: 16 }}>
          <Tag color="geekblue">{frameBadge}</Tag>
        </div>
        {frame.visibleObstacles.slice(0, 3).map((obstacle, index) => (
          <div
            key={`${feed.cameraId}-${obstacle.id}`}
            style={{
              position: 'absolute',
              left: `${28 + index * 18}%`,
              top: `${34 + index * 10}%`,
              border: `2px solid ${riskColor[obstacle.risk]}`,
              borderRadius: 8,
              padding: '4px 8px',
              color: '#f8fafc',
              background: 'rgba(15, 23, 42, 0.58)',
              fontSize: 12,
            }}
          >
            {obstacleLabels[obstacle.id] ?? obstacle.label}
          </div>
        ))}
        <Text style={{ position: 'absolute', right: 16, bottom: 12, color: '#cbd5e1' }}>
          {feed.detectedObstacleIds.length} {t('webviz.objects')}
        </Text>
      </div>
    </Card>
  );
}

export default function AutonomousWebviz() {
  const { t } = useTranslation();
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = getReplayFrame(frameIndex);
  const stats = useMemo(() => getReplayStats(frame), [frame]);
  const maxFrame = autonomousReplayScenario.frames.length - 1;
  const progressPercent = Math.round((frame.frameIndex / maxFrame) * 100);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((currentFrameIndex) => (currentFrameIndex >= maxFrame ? 0 : currentFrameIndex + 1));
    }, 900);

    return () => window.clearInterval(timer);
  }, [maxFrame, playing]);

  return (
    <div>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            {t('webviz.title')}
          </Title>
          <Text type="secondary">{t('webviz.subtitle')}</Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={6} xl={4}>
            <Card>
              <Statistic title={t('webviz.speed')} value={stats.speedKph} suffix="km/h" prefix={<CarOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={6} xl={4}>
            <Card>
              <Statistic title={t('webviz.obstacles')} value={stats.obstacleCount} prefix={<AimOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={6} xl={4}>
            <Card>
              <Statistic title={t('webviz.lidarPoints')} value={stats.lidarPointCount} prefix={<RadarChartOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={6} xl={4}>
            <Card>
              <Statistic title={t('webviz.radarDetections')} value={stats.radarDetectionCount} prefix={<AimOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={6} xl={4}>
            <Card>
              <Statistic title={t('webviz.nearestObstacle')} value={stats.nearestObstacleMeters} suffix="m" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} xl={14}>
            <BirdseyeScene frame={frame} />
          </Col>
          <Col xs={24} xl={10}>
            <Row gutter={[16, 16]}>
              {frame.cameraFeeds.map((feed, index) => (
                <Col xs={24} md={12} xl={24} xxl={12} key={feed.cameraId}>
                  <CameraPanel feedIndex={index} frame={frame} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <Card>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Space wrap>
              <Button
                type="primary"
                size="large"
                icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => setPlaying((current) => !current)}
              >
                {playing ? t('webviz.pause') : t('webviz.play')}
              </Button>
              <Tag color="blue">
                {t('webviz.frame')} {frame.frameIndex + 1}/{autonomousReplayScenario.frames.length}
              </Tag>
              <Tag color="purple">{formatTimestamp(frame.timestampMs)}</Tag>
              <Tag color="cyan">
                {stats.cameraCount} {t('webviz.cameras')}
              </Tag>
            </Space>
            <Slider
              min={0}
              max={maxFrame}
              value={frameIndex}
              onChange={(value) => setFrameIndex(Array.isArray(value) ? value[0] : value)}
              marks={Object.fromEntries(
                autonomousReplayScenario.frames.map((replayFrame) => [
                  replayFrame.frameIndex,
                  formatTimestamp(replayFrame.timestampMs),
                ]),
              )}
            />
            <Progress percent={progressPercent} showInfo={false} strokeColor="#6366f1" />
          </Space>
        </Card>
      </Space>
    </div>
  );
}
