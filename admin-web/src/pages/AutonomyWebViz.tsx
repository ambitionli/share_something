import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
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
  CarOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RadarChartOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  autonomyReplay,
  buildLidarPoints,
  formatReplayTime,
  getFrameAtTime,
  getSceneSummary,
  type CameraFeed,
  type LidarPoint,
  type ReplayFrame,
  type SceneObject,
} from '../utils/autonomyReplay';

const { Title, Text } = Typography;

const SCENE_WIDTH = 880;
const SCENE_HEIGHT = 560;
const ROAD_X = 300;
const ROAD_WIDTH = 280;
const CAR_X = 440;
const CAR_Y = 400;
const METERS_X_TO_PX = 18;
const METERS_Y_TO_PX = 5.2;

const buildings = [
  { id: 'l1', x: 42, y: 44, width: 110, height: 104, fill: '#334155' },
  { id: 'l2', x: 160, y: 112, width: 92, height: 128, fill: '#475569' },
  { id: 'l3', x: 52, y: 290, width: 132, height: 150, fill: '#1f2937' },
  { id: 'r1', x: 626, y: 62, width: 118, height: 132, fill: '#374151' },
  { id: 'r2', x: 758, y: 152, width: 76, height: 118, fill: '#475569' },
  { id: 'r3', x: 652, y: 340, width: 152, height: 142, fill: '#1e293b' },
];

const laneMarks = [70, 150, 230, 310, 390, 470];

function toScenePoint(xMeters: number, yMeters: number, vehicleY: number) {
  return {
    x: CAR_X + xMeters * METERS_X_TO_PX,
    y: CAR_Y - (yMeters - vehicleY) * METERS_Y_TO_PX,
  };
}

function riskColor(risk: SceneObject['risk']) {
  switch (risk) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#22c55e';
    default:
      return '#64748b';
  }
}

function objectShape(object: SceneObject, point: { x: number; y: number }) {
  const color = riskColor(object.risk);

  switch (object.kind) {
    case 'vehicle':
      return <rect x={point.x - 18} y={point.y - 28} width={36} height={56} rx={8} fill={color} />;
    case 'pedestrian':
      return <circle cx={point.x} cy={point.y} r={12} fill={color} />;
    case 'cyclist':
      return <ellipse cx={point.x} cy={point.y} rx={18} ry={11} fill={color} />;
    case 'barrier':
      return <rect x={point.x - 24} y={point.y - 10} width={48} height={20} rx={4} fill={color} />;
    case 'cone':
      return <polygon points={`${point.x},${point.y - 17} ${point.x - 14},${point.y + 14} ${point.x + 14},${point.y + 14}`} fill={color} />;
    default:
      return <circle cx={point.x} cy={point.y} r={10} fill={color} />;
  }
}

function renderLidarPoint(point: LidarPoint, vehicleY: number) {
  const scenePoint = toScenePoint(point.x, point.y, vehicleY);
  const opacity = 0.25 + point.intensity * 0.55;

  return (
    <circle
      key={point.id}
      cx={scenePoint.x}
      cy={scenePoint.y}
      r={1.9}
      fill={`rgba(56, 189, 248, ${opacity})`}
    />
  );
}

function renderObstacle(object: SceneObject, frame: ReplayFrame) {
  const point = toScenePoint(object.x, object.y, frame.vehicle.y);

  return (
    <g key={object.id}>
      {objectShape(object, point)}
      <line
        x1={CAR_X}
        y1={CAR_Y - 20}
        x2={point.x}
        y2={point.y}
        stroke={riskColor(object.risk)}
        strokeDasharray="5 8"
        strokeOpacity={0.35}
      />
      <text x={point.x + 18} y={point.y - 16} fill="#e2e8f0" fontSize="13" fontWeight={600}>
        {object.label}
      </text>
    </g>
  );
}

function cameraObjects(camera: CameraFeed, frame: ReplayFrame) {
  if (camera.direction === 'left') {
    return frame.obstacles.filter((object) => object.side === 'left');
  }

  if (camera.direction === 'right') {
    return frame.obstacles.filter((object) => object.side === 'right');
  }

  return frame.obstacles.filter((object) => object.y >= frame.vehicle.y);
}

function cameraBackground(camera: CameraFeed, timestamp: number): CSSProperties {
  const hue = camera.direction === 'front' ? 216 : camera.direction === 'rear' ? 186 : 242;
  const offset = Math.round(timestamp * 18);

  return {
    background:
      `linear-gradient(180deg, hsl(${hue} 52% 22%) 0%, hsl(${hue} 42% 13%) 52%, #0f172a 100%), ` +
      `repeating-linear-gradient(${90 + offset}deg, rgba(255,255,255,0.24) 0 2px, transparent 2px 28px)`,
  };
}

function CameraPanel({ camera, frame }: { camera: CameraFeed; frame: ReplayFrame }) {
  const { t } = useTranslation();
  const objects = cameraObjects(camera, frame);

  return (
    <Card
      size="small"
      title={
        <Space>
          <VideoCameraOutlined />
          <span>{camera.name}</span>
        </Space>
      }
      style={{ background: '#0f172a', borderColor: '#1e293b' }}
      styles={{ header: { color: '#e2e8f0', borderColor: '#1e293b' } }}
    >
      <div style={{ ...cameraBackground(camera, frame.timestamp), height: 136, borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '52% 12% 0', borderTop: '2px solid rgba(255,255,255,0.28)', transform: 'perspective(180px) rotateX(58deg)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <Tag color="blue">{t('autonomy.camera.replay')}</Tag>
          <Tag color={objects.some((object) => object.risk === 'high') ? 'red' : 'green'}>
            {objects.length} {t('autonomy.camera.objects')}
          </Tag>
        </div>
        <Space size={6} wrap style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
          {objects.slice(0, 3).map((object) => (
            <Tag key={object.id} color={object.risk === 'high' ? 'red' : object.risk === 'medium' ? 'gold' : 'green'}>
              {object.label}
            </Tag>
          ))}
        </Space>
      </div>
    </Card>
  );
}

export default function AutonomyWebViz() {
  const { t } = useTranslation();
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = useMemo(() => getFrameAtTime(autonomyReplay, time), [time]);
  const points = useMemo(() => buildLidarPoints(frame), [frame]);
  const summary = useMemo(() => getSceneSummary(autonomyReplay, frame), [frame]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = window.setInterval(() => {
      setTime((current) => {
        const next = Number((current + 0.2).toFixed(1));
        return next > autonomyReplay.duration ? 0 : next;
      });
    }, 240);

    return () => window.clearInterval(interval);
  }, [playing]);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Row gutter={[24, 24]} align="middle">
        <Col flex="auto">
          <Title level={2} style={{ margin: 0 }}>{t('autonomy.title')}</Title>
          <Text type="secondary">{t('autonomy.subtitle')}</Text>
        </Col>
        <Col>
          <Space>
            <Tag color="geekblue">{t('autonomy.badge')}</Tag>
            <Button
              type="primary"
              icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setPlaying((current) => !current)}
            >
              {playing ? t('autonomy.controls.pause') : t('autonomy.controls.play')}
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title={t('autonomy.stats.speed')} value={frame.vehicle.speedKph} suffix="km/h" prefix={<CarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title={t('autonomy.stats.points')} value={summary.totalPointCount} prefix={<RadarChartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title={t('autonomy.stats.obstacles')} value={summary.activeObstacleCount} suffix={`/ ${summary.cameraCount} cams`} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>{t('autonomy.controls.timeline')}</Text>
            <Text code>{formatReplayTime(time)} / {formatReplayTime(autonomyReplay.duration)}</Text>
          </Space>
          <Slider
            min={0}
            max={autonomyReplay.duration}
            step={0.2}
            value={time}
            onChange={(value) => {
              if (typeof value === 'number') {
                setTime(value);
              }
            }}
          />
          <Progress percent={Math.round((time / autonomyReplay.duration) * 100)} showInfo={false} />
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={15}>
          <Card title={t('autonomy.scene.title')} extra={<Tag color="cyan">{t('autonomy.scene.lidar')}</Tag>}>
            <div style={{ background: '#020617', borderRadius: 18, overflow: 'hidden', border: '1px solid #1e293b' }}>
              <svg viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`} width="100%" role="img" aria-label={t('autonomy.scene.title')}>
                <defs>
                  <linearGradient id="road" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1f2937" />
                    <stop offset="100%" stopColor="#111827" />
                  </linearGradient>
                  <radialGradient id="lidarSweep" cx="50%" cy="68%" r="55%">
                    <stop offset="0%" stopColor="rgba(14,165,233,0.34)" />
                    <stop offset="100%" stopColor="rgba(14,165,233,0)" />
                  </radialGradient>
                </defs>

                <rect width={SCENE_WIDTH} height={SCENE_HEIGHT} fill="#020617" />
                <rect x={ROAD_X} y={0} width={ROAD_WIDTH} height={SCENE_HEIGHT} fill="url(#road)" />
                <rect x={ROAD_X - 32} y={0} width={28} height={SCENE_HEIGHT} fill="#14532d" opacity={0.55} />
                <rect x={ROAD_X + ROAD_WIDTH + 4} y={0} width={28} height={SCENE_HEIGHT} fill="#14532d" opacity={0.55} />

                {buildings.map((building) => (
                  <g key={building.id}>
                    <rect {...building} rx={10} />
                    {Array.from({ length: 4 }, (_, index) => (
                      <rect
                        key={`${building.id}-window-${index}`}
                        x={building.x + 18 + (index % 2) * 38}
                        y={building.y + 18 + Math.floor(index / 2) * 42}
                        width={18}
                        height={18}
                        rx={3}
                        fill="#fef3c7"
                        opacity={0.72}
                      />
                    ))}
                  </g>
                ))}

                {[ROAD_X + ROAD_WIDTH / 3, ROAD_X + (ROAD_WIDTH / 3) * 2].map((x) => (
                  <g key={x}>
                    {laneMarks.map((y) => (
                      <rect key={`${x}-${y}`} x={x - 3} y={y} width={6} height={38} rx={3} fill="#f8fafc" opacity={0.55} />
                    ))}
                  </g>
                ))}

                <circle cx={CAR_X} cy={CAR_Y} r={190} fill="url(#lidarSweep)" />
                <circle cx={CAR_X} cy={CAR_Y} r={74} fill="none" stroke="#38bdf8" strokeOpacity={0.22} />
                <circle cx={CAR_X} cy={CAR_Y} r={136} fill="none" stroke="#38bdf8" strokeOpacity={0.18} />
                {points.map((point) => renderLidarPoint(point, frame.vehicle.y))}
                {frame.obstacles.map((object) => renderObstacle(object, frame))}

                <g transform={`translate(${CAR_X} ${CAR_Y}) rotate(${frame.vehicle.headingDeg})`}>
                  <rect x={-22} y={-42} width={44} height={84} rx={12} fill="#6366f1" />
                  <rect x={-14} y={-30} width={28} height={22} rx={6} fill="#c7d2fe" opacity={0.9} />
                  <rect x={-15} y={14} width={30} height={18} rx={5} fill="#312e81" opacity={0.8} />
                  <path d="M0 -64 L24 -32 L-24 -32 Z" fill="#a5b4fc" opacity={0.38} />
                </g>
              </svg>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {autonomyReplay.cameras.map((camera) => (
              <CameraPanel key={camera.id} camera={camera} frame={frame} />
            ))}
          </Space>
        </Col>
      </Row>
    </Space>
  );
}
