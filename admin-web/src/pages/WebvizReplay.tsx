import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button, Card, Col, Progress, Row, Slider, Space, Statistic, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  createWebvizReplay,
  frameAtTime,
  playbackSummary,
  type Building,
  type CameraFeed,
  type CameraSnapshot,
  type Obstacle,
} from '../features/webviz/replayModel';

const { Text, Title } = Typography;

const styles: Record<string, CSSProperties> = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  sceneCard: {
    overflow: 'hidden',
  },
  scene: {
    width: '100%',
    minHeight: 520,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #0f172a 0%, #111827 54%, #1e293b 100%)',
    padding: 16,
    boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.22)',
  },
  svg: {
    width: '100%',
    height: 480,
    display: 'block',
  },
  cameraGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  },
  cameraView: {
    height: 142,
    borderRadius: 14,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#e5e7eb',
    overflow: 'hidden',
    position: 'relative',
    background: 'linear-gradient(160deg, #111827 0%, #1f2937 55%, #0f172a 100%)',
  },
  cameraHorizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    height: 44,
    background: 'linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.28), rgba(148,163,184,0.08))',
    transform: 'skewY(-4deg)',
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: 16,
    alignItems: 'center',
  },
};

export default function WebvizReplay() {
  const { t } = useTranslation();
  const replay = useMemo(() => createWebvizReplay(), []);
  const summary = useMemo(() => playbackSummary(replay), [replay]);
  const [timeMs, setTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const frame = frameAtTime(replay, timeMs);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeMs((current) => {
        const next = current + 250;
        return next > replay.durationMs ? 0 : next;
      });
    }, 450);

    return () => window.clearInterval(timer);
  }, [isPlaying, replay.durationMs]);

  const progressPercent = replay.durationMs === 0 ? 0 : Math.round((timeMs / replay.durationMs) * 100);

  const cameraFeedName = (id: CameraFeed['id']) => {
    switch (id) {
      case 'front':
        return t('webviz.cameraFeeds.front.name');
      case 'left':
        return t('webviz.cameraFeeds.left.name');
      case 'right':
        return t('webviz.cameraFeeds.right.name');
      case 'rear':
        return t('webviz.cameraFeeds.rear.name');
      default:
        return id;
    }
  };

  const cameraFeedPosition = (id: CameraFeed['id']) => {
    switch (id) {
      case 'front':
        return t('webviz.cameraFeeds.front.position');
      case 'left':
        return t('webviz.cameraFeeds.left.position');
      case 'right':
        return t('webviz.cameraFeeds.right.position');
      case 'rear':
        return t('webviz.cameraFeeds.rear.position');
      default:
        return id;
    }
  };

  const cameraSnapshotLabel = (key: CameraSnapshot['labelKey']) => {
    switch (key) {
      case 'frontRoad':
        return t('webviz.cameraLabels.frontRoad');
      case 'leftCurb':
        return t('webviz.cameraLabels.leftCurb');
      case 'rightCurb':
        return t('webviz.cameraLabels.rightCurb');
      case 'rearRoad':
        return t('webviz.cameraLabels.rearRoad');
      default:
        return key;
    }
  };

  const cameraSnapshotDescription = (key: CameraSnapshot['descriptionKey']) => {
    switch (key) {
      case 'frontClear':
        return t('webviz.cameraDescriptions.frontClear');
      case 'frontPedestrian':
        return t('webviz.cameraDescriptions.frontPedestrian');
      case 'leftCurb':
        return t('webviz.cameraDescriptions.leftCurb');
      case 'rightStation':
        return t('webviz.cameraDescriptions.rightStation');
      case 'rightPedestrian':
        return t('webviz.cameraDescriptions.rightPedestrian');
      case 'rearRoad':
        return t('webviz.cameraDescriptions.rearRoad');
      default:
        return key;
    }
  };

  const cameraAlert = (key: NonNullable<CameraSnapshot['alertKey']>) => {
    switch (key) {
      case 'pedestrianCrosswalk':
        return t('webviz.alerts.pedestrianCrosswalk');
      case 'vruCandidate':
        return t('webviz.alerts.vruCandidate');
      default:
        return key;
    }
  };

  const buildingLabel = (building: Building) => {
    switch (building.id) {
      case 'b-01':
        return t('webviz.buildings.officeA');
      case 'b-02':
        return t('webviz.buildings.mall');
      case 'b-03':
        return t('webviz.buildings.hotel');
      case 'b-04':
        return t('webviz.buildings.parkTower');
      case 'b-05':
        return t('webviz.buildings.station');
      case 'b-06':
        return t('webviz.buildings.depot');
      default:
        return building.label;
    }
  };

  const obstacleLabel = (obstacle: Obstacle) => {
    switch (obstacle.id) {
      case 'veh-01':
        return t('webviz.obstacles.labels.truck');
      case 'ped-01':
        return t('webviz.obstacles.labels.pedestrian');
      case 'cone-01':
      case 'cone-02':
        return t('webviz.obstacles.labels.cone');
      case 'barrier-01':
        return t('webviz.obstacles.labels.barrier');
      case 'veh-02':
        return t('webviz.obstacles.labels.sedan');
      default:
        return obstacle.label;
    }
  };

  const obstacleTypeLabel = (type: Obstacle['type']) => {
    switch (type) {
      case 'vehicle':
        return t('webviz.obstacles.types.vehicle');
      case 'pedestrian':
        return t('webviz.obstacles.types.pedestrian');
      case 'barrier':
        return t('webviz.obstacles.types.barrier');
      case 'cone':
        return t('webviz.obstacles.types.cone');
      default:
        return type;
    }
  };

  const riskLabel = (risk: Obstacle['risk']) => {
    switch (risk) {
      case 'high':
        return t('webviz.obstacles.risks.high');
      case 'medium':
        return t('webviz.obstacles.risks.medium');
      case 'low':
        return t('webviz.obstacles.risks.low');
      default:
        return risk;
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.hero}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>{t('webviz.title')}</Title>
          <Text type="secondary">{t('webviz.subtitle')}</Text>
        </div>
        <Space wrap>
          <Tag color={isPlaying ? 'green' : 'default'}>
            {isPlaying ? t('webviz.statusReplay') : t('webviz.statusPaused')}
          </Tag>
          <Tag color="blue">{formatTime(frame.timeMs)}</Tag>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title={t('webviz.stats.frames')} value={summary.totalFrames} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title={t('webviz.stats.lidarPoints')} value={frame.lidarPoints.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title={t('webviz.stats.cameras')} value={summary.cameraCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title={t('webviz.stats.speed')} value={frame.ego.speedKph} suffix="km/h" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title={t('webviz.sceneTitle')} style={styles.sceneCard}>
            <div style={styles.scene}>
              <ReplayScene replay={replay} frame={frame} buildingLabel={buildingLabel} obstacleLabel={obstacleLabel} />
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card title={t('webviz.playbackTitle')}>
              <div style={styles.controls}>
                <Button type="primary" onClick={() => setIsPlaying((value) => !value)}>
                  {isPlaying ? t('webviz.pause') : t('webviz.play')}
                </Button>
                <Slider
                  min={0}
                  max={replay.durationMs}
                  step={250}
                  value={timeMs}
                  tooltip={{ formatter: (value) => formatTime(value ?? 0) }}
                  onChange={(value) => {
                    if (typeof value === 'number') {
                      setTimeMs(value);
                    }
                  }}
                />
                <Text strong>{formatTime(timeMs)}</Text>
              </div>
              <Progress percent={progressPercent} size="small" style={{ marginTop: 12 }} />
            </Card>

            <Card title={t('webviz.obstacleTitle')}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {frame.obstacles.map((obstacle) => (
                  <ObstacleRow
                    key={obstacle.id}
                    obstacle={obstacle}
                    label={obstacleLabel(obstacle)}
                    typeLabel={obstacleTypeLabel(obstacle.type)}
                    riskLabel={riskLabel(obstacle.risk)}
                  />
                ))}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Card title={t('webviz.cameraTitle')}>
        <div style={styles.cameraGrid}>
          {replay.cameraFeeds.map((feed) => {
            const snapshot = frame.cameraSnapshots[feed.id];
            const alertText = snapshot.alertKey ? cameraAlert(snapshot.alertKey) : t('webviz.cameraOk');
            return (
              <div key={feed.id} style={{ ...styles.cameraView, boxShadow: `inset 0 0 0 1px ${feed.accent}` }}>
                <div style={styles.cameraHorizon} />
                <Space style={{ justifyContent: 'space-between', width: '100%', position: 'relative' }}>
                  <Text style={{ color: '#f8fafc', fontWeight: 700 }}>{cameraFeedName(feed.id)}</Text>
                  <Tag color={snapshot.alertKey ? 'red' : 'green'}>{alertText}</Tag>
                </Space>
                <div style={{ position: 'relative' }}>
                  <Text style={{ color: '#cbd5e1', display: 'block' }}>{cameraFeedPosition(feed.id)}</Text>
                  <Text style={{ color: '#f8fafc', display: 'block', fontWeight: 600 }}>
                    {cameraSnapshotLabel(snapshot.labelKey)}
                  </Text>
                  <Text style={{ color: '#94a3b8' }}>{cameraSnapshotDescription(snapshot.descriptionKey)}</Text>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ReplayScene({
  replay,
  frame,
  buildingLabel,
  obstacleLabel,
}: {
  replay: ReturnType<typeof createWebvizReplay>;
  frame: ReturnType<typeof frameAtTime>;
  buildingLabel: (building: Building) => string;
  obstacleLabel: (obstacle: Obstacle) => string;
}) {
  const roadX = replay.laneCenterX - replay.roadWidth / 2;
  const laneXs = [replay.laneCenterX - 70, replay.laneCenterX, replay.laneCenterX + 70];

  return (
    <svg viewBox="0 0 820 480" role="img" aria-label="Autonomous driving replay scene" style={styles.svg}>
      <defs>
        <linearGradient id="road" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#273449" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <radialGradient id="lidar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.06" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="820" height="480" rx="22" fill="#0f172a" />
      {replay.buildings.map((building) => (
        <g key={building.id}>
          <rect
            x={building.x}
            y={building.y}
            width={building.width}
            height={building.height}
            rx="12"
            fill="#263244"
            stroke="#475569"
          />
          <text x={building.x + 14} y={building.y + 28} fill="#94a3b8" fontSize="13">
            {buildingLabel(building)}
          </text>
        </g>
      ))}

      <rect x={roadX} y="0" width={replay.roadWidth} height="480" fill="url(#road)" />
      <rect x={roadX - 10} y="0" width="10" height="480" fill="#334155" />
      <rect x={roadX + replay.roadWidth} y="0" width="10" height="480" fill="#334155" />

      {laneXs.map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1="0"
          y2="480"
          stroke="#eab308"
          strokeDasharray="24 22"
          strokeOpacity="0.56"
          strokeWidth="3"
        />
      ))}

      <ellipse cx={frame.ego.x} cy={frame.ego.y} rx="156" ry="104" fill="url(#lidar)" />
      {frame.lidarPoints.map((point) => (
        <circle
          key={point.id}
          cx={point.x}
          cy={point.y}
          r={2.2 + point.intensity}
          fill="#67e8f9"
          opacity={Math.min(point.intensity, 1)}
        />
      ))}

      {frame.obstacles.map((obstacle) => (
        <ObstacleMarker key={obstacle.id} obstacle={obstacle} label={obstacleLabel(obstacle)} />
      ))}

      <g transform={`translate(${frame.ego.x} ${frame.ego.y}) rotate(${frame.ego.headingDeg})`}>
        <rect x="-18" y="-34" width="36" height="68" rx="10" fill="#2563eb" stroke="#bfdbfe" strokeWidth="2" />
        <rect x="-12" y="-23" width="24" height="18" rx="5" fill="#93c5fd" opacity="0.9" />
        <circle cx="-11" cy="24" r="4" fill="#020617" />
        <circle cx="11" cy="24" r="4" fill="#020617" />
        <path d="M -18 -4 L -88 -42 M 18 -4 L 88 -42" stroke="#60a5fa" strokeOpacity="0.52" strokeWidth="2" />
      </g>
    </svg>
  );
}

function ObstacleMarker({ obstacle, label }: { obstacle: Obstacle; label: string }) {
  if (obstacle.type === 'pedestrian') {
    return (
      <g>
        <circle cx={obstacle.x} cy={obstacle.y} r="13" fill={riskColor(obstacle.risk)} stroke="#fecaca" strokeWidth="2" />
        <text x={obstacle.x + 18} y={obstacle.y + 4} fill="#fee2e2" fontSize="12">{label}</text>
      </g>
    );
  }

  return (
    <g>
      <rect
        x={obstacle.x - obstacle.width / 2}
        y={obstacle.y - obstacle.height / 2}
        width={obstacle.width}
        height={obstacle.height}
        rx="8"
        fill={riskColor(obstacle.risk)}
        stroke="#fef3c7"
        strokeWidth="2"
      />
      <text x={obstacle.x + obstacle.width / 2 + 6} y={obstacle.y + 4} fill="#fde68a" fontSize="12">
        {label}
      </text>
    </g>
  );
}

function ObstacleRow({
  obstacle,
  label,
  typeLabel,
  riskLabel,
}: {
  obstacle: Obstacle;
  label: string;
  typeLabel: string;
  riskLabel: string;
}) {
  return (
    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
      <Text strong>{label}</Text>
      <Space>
        <Tag>{typeLabel}</Tag>
        <Tag color={riskTagColor(obstacle.risk)}>{riskLabel}</Tag>
      </Space>
    </Space>
  );
}

function riskColor(risk: Obstacle['risk']) {
  switch (risk) {
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#d97706';
    case 'low':
      return '#16a34a';
    default:
      return '#64748b';
  }
}

function riskTagColor(risk: Obstacle['risk']) {
  switch (risk) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'default';
  }
}

function formatTime(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`;
}
