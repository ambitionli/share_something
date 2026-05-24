import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Progress, Row, Slider, Space, Statistic, Tag, Typography } from 'antd';
import { PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  classifyObstacleRisk,
  formatPlaybackTime,
  getReplayFrame,
  replayFrames,
  summarizePointCloud,
  summarizeRadarDetections,
  type CameraObjectKey,
  type CameraDirection,
  type ObstacleKind,
  type ObstacleRisk,
} from '../utils/autonomousReplay';

const { Text, Title } = Typography;

const riskColors: Record<ObstacleRisk, string> = {
  danger: 'red',
  watch: 'gold',
  clear: 'green',
};

const cameraGradients: Record<CameraDirection, string> = {
  front: 'linear-gradient(135deg, #172554 0%, #2563eb 52%, #93c5fd 100%)',
  left: 'linear-gradient(135deg, #312e81 0%, #7c3aed 48%, #ddd6fe 100%)',
  right: 'linear-gradient(135deg, #064e3b 0%, #059669 54%, #a7f3d0 100%)',
  rear: 'linear-gradient(135deg, #431407 0%, #ea580c 54%, #fed7aa 100%)',
};

export default function AutonomousWebviz() {
  const { t } = useTranslation();
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentFrame = getReplayFrame(replayFrames, frameIndex);
  const pointCloudSummary = useMemo(() => summarizePointCloud(currentFrame.lidarPoints), [currentFrame]);
  const radarSummary = useMemo(() => summarizeRadarDetections(currentFrame.radarDetections), [currentFrame]);
  const riskLabels: Record<ObstacleRisk, string> = {
    danger: t('webviz.risk.danger'),
    watch: t('webviz.risk.watch'),
    clear: t('webviz.risk.clear'),
  };
  const obstacleKindLabels: Record<ObstacleKind, string> = {
    vehicle: t('webviz.obstacleKinds.vehicle'),
    pedestrian: t('webviz.obstacleKinds.pedestrian'),
    cone: t('webviz.obstacleKinds.cone'),
    barrier: t('webviz.obstacleKinds.barrier'),
  };
  const obstacleLabels: Record<string, string> = {
    'obs-lead-car': t('webviz.obstacles.leadVehicle'),
    'obs-cone-right': t('webviz.obstacles.constructionCone'),
    'obs-ped-left': t('webviz.obstacles.pedestrian'),
    'obs-barrier': t('webviz.obstacles.roadBarrier'),
    'obs-ped-right': t('webviz.obstacles.pedestrianCrossing'),
    'obs-parked-left': t('webviz.obstacles.parkedVehicle'),
    'obs-cone-left': t('webviz.obstacles.laneCone'),
  };
  const cameraLabels: Record<CameraDirection, string> = {
    front: t('webviz.cameras.front'),
    left: t('webviz.cameras.left'),
    right: t('webviz.cameras.right'),
    rear: t('webviz.cameras.rear'),
  };
  const cameraObjectLabels: Record<CameraObjectKey, string> = {
    leadCar: t('webviz.cameraObjects.leadCar'),
    trafficCone: t('webviz.cameraObjects.trafficCone'),
    buildingFacade: t('webviz.cameraObjects.buildingFacade'),
    parkingVehicle: t('webviz.cameraObjects.parkingVehicle'),
    pedestrian: t('webviz.cameraObjects.pedestrian'),
    roadSign: t('webviz.cameraObjects.roadSign'),
    followingCar: t('webviz.cameraObjects.followingCar'),
    laneMarker: t('webviz.cameraObjects.laneMarker'),
    roadBarrier: t('webviz.cameraObjects.roadBarrier'),
    laneCone: t('webviz.cameraObjects.laneCone'),
  };

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((previousIndex) => (previousIndex + 1) % replayFrames.length);
    }, 1100);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const playbackPercent = Math.round((frameIndex / (replayFrames.length - 1)) * 100);

  return (
    <div>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>{t('webviz.title')}</Title>
          <Text type="secondary">{t('webviz.subtitle')}</Text>
        </div>

        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={7}>
              <Space>
                <Button
                  type="primary"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={() => setIsPlaying((value) => !value)}
                >
                  {isPlaying ? t('webviz.pause') : t('webviz.play')}
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setFrameIndex(0);
                    setIsPlaying(false);
                  }}
                >
                  {t('webviz.reset')}
                </Button>
              </Space>
            </Col>
            <Col xs={24} lg={13}>
              <Slider
                min={0}
                max={replayFrames.length - 1}
                value={frameIndex}
                marks={replayFrames.reduce<Record<number, string>>((marks, frame, index) => {
                  marks[index] = formatPlaybackTime(frame.timestampSeconds);
                  return marks;
                }, {})}
                onChange={(value) => setFrameIndex(value)}
              />
            </Col>
            <Col xs={24} lg={4}>
              <Progress percent={playbackPercent} size="small" />
              <Text type="secondary">{t('webviz.time')}: {formatPlaybackTime(currentFrame.timestampSeconds)}</Text>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} xl={15}>
            <Card title={t('webviz.sceneReplay')} extra={<Tag color="blue">Webviz</Tag>}>
              <div style={{ position: 'relative', minHeight: 520, overflow: 'hidden', borderRadius: 18, background: '#0f172a' }}>
                <RoadScene frameIndex={frameIndex} />
                <LidarOverlay frameIndex={frameIndex} />
                <RadarOverlay frameIndex={frameIndex} />
                <ObstacleOverlay frameIndex={frameIndex} obstacleKindLabels={obstacleKindLabels} />
                <EgoVehicle headingDeg={currentFrame.egoPose.headingDeg} />
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <Card title={t('webviz.telemetry')}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic title={t('webviz.speed')} value={currentFrame.speedKph} suffix="km/h" />
                  </Col>
                  <Col span={8}>
                    <Statistic title={t('webviz.steering')} value={currentFrame.steeringDeg} suffix="deg" />
                  </Col>
                  <Col span={8}>
                    <Statistic title={t('webviz.points')} value={pointCloudSummary.total} />
                  </Col>
                </Row>
              </Card>

              <Card title={t('webviz.lidarPointCloud')}>
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Statistic title={t('webviz.nearField')} value={pointCloudSummary.nearField} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={t('webviz.highIntensity')} value={pointCloudSummary.highIntensity} />
                  </Col>
                </Row>
                <div style={{ marginTop: 16, height: 160, position: 'relative', borderRadius: 14, background: 'radial-gradient(circle, #1e293b 0%, #020617 72%)' }}>
                  {currentFrame.lidarPoints.slice(0, 36).map((point, index) => (
                    <span
                      key={`${currentFrame.id}-mini-point-${index}`}
                      style={{
                        position: 'absolute',
                        width: 4 + point.intensity * 6,
                        height: 4 + point.intensity * 6,
                        borderRadius: '50%',
                        left: `${12 + (point.x % 36) * 2.1}%`,
                        top: `${48 + point.y * 4}%`,
                        background: point.intensity >= 0.8 ? '#facc15' : '#22d3ee',
                        boxShadow: `0 0 ${8 + point.intensity * 8}px rgba(34, 211, 238, 0.8)`,
                      }}
                    />
                  ))}
                </div>
              </Card>

              <Card title={t('webviz.radarDetections')}>
                <Row gutter={[12, 12]}>
                  <Col span={8}>
                    <Statistic title={t('webviz.radarTargets')} value={radarSummary.total} />
                  </Col>
                  <Col span={8}>
                    <Statistic title={t('webviz.approaching')} value={radarSummary.approaching} />
                  </Col>
                  <Col span={8}>
                    <Statistic title={t('webviz.closestRange')} value={radarSummary.closestRangeMeters} suffix="m" />
                  </Col>
                </Row>
                <div style={{ marginTop: 16, height: 150, position: 'relative', overflow: 'hidden', borderRadius: 14, background: 'radial-gradient(circle at 50% 100%, rgba(34,197,94,0.34), #020617 62%)' }}>
                  {[0, 1, 2].map((ring) => (
                    <div
                      key={`radar-ring-${ring}`}
                      style={{
                        position: 'absolute',
                        left: `${18 + ring * 12}%`,
                        right: `${18 + ring * 12}%`,
                        bottom: -38 - ring * 22,
                        height: 140 + ring * 44,
                        border: '1px solid rgba(34, 197, 94, 0.32)',
                        borderRadius: '50% 50% 0 0',
                      }}
                    />
                  ))}
                  {currentFrame.radarDetections.map((detection) => (
                    <span
                      key={detection.id}
                      style={{
                        position: 'absolute',
                        left: `${50 + detection.azimuthDeg * 1.5}%`,
                        bottom: `${12 + Math.max(0, 56 - detection.rangeMeters) * 1.8}%`,
                        width: 10 + detection.confidence * 8,
                        height: 10 + detection.confidence * 8,
                        borderRadius: '50%',
                        background: detection.relativeVelocityKph < 0 ? '#fb923c' : '#22c55e',
                        boxShadow: '0 0 18px rgba(251, 146, 60, 0.75)',
                      }}
                    />
                  ))}
                </div>
              </Card>

              <Card title={t('webviz.obstacleTracking')}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {currentFrame.obstacles.map((obstacle) => {
                    const risk = classifyObstacleRisk(obstacle.distanceMeters);

                    return (
                      <div key={obstacle.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <Text strong>{obstacleLabels[obstacle.id]}</Text>
                          <div><Text type="secondary">{obstacleKindLabels[obstacle.kind]} · {obstacle.velocityKph} km/h</Text></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Tag color={riskColors[risk]}>{riskLabels[risk]}</Tag>
                          <div><Text>{obstacle.distanceMeters} m</Text></div>
                        </div>
                      </div>
                    );
                  })}
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>

        <Card title={t('webviz.cameraPlayback')}>
          <Row gutter={[16, 16]}>
            {currentFrame.cameraFeeds.map((camera) => (
              <Col xs={24} md={12} xl={6} key={camera.direction}>
                <div style={{ borderRadius: 16, overflow: 'hidden', background: '#020617', border: '1px solid #1e293b' }}>
                  <div style={{ height: 160, position: 'relative', background: cameraGradients[camera.direction] }}>
                    <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 12 }} />
                    <div style={{ position: 'absolute', left: 28, right: 28, bottom: 30 + camera.sceneShift % 18, height: 42, transform: 'skewX(-16deg)', background: 'rgba(15, 23, 42, 0.55)' }} />
                    <div style={{ position: 'absolute', left: `${34 + camera.sceneShift % 22}%`, bottom: 34, width: 46, height: 24, borderRadius: 6, background: 'rgba(248, 250, 252, 0.75)' }} />
                    <Text style={{ position: 'absolute', left: 16, top: 12, color: '#fff', fontWeight: 600 }}>{cameraLabels[camera.direction]}</Text>
                    <Text style={{ position: 'absolute', right: 16, top: 12, color: '#dbeafe' }}>{camera.exposure}</Text>
                  </div>
                  <div style={{ padding: 12 }}>
                    <Text type="secondary">{t('webviz.detected')}: </Text>
                    {camera.detectedObjectKeys.map((objectKey) => (
                      <Tag key={objectKey} color="geekblue">{cameraObjectLabels[objectKey]}</Tag>
                    ))}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </Space>
    </div>
  );
}

function RoadScene({ frameIndex }: { frameIndex: number }) {
  const buildingOffset = (frameIndex * 34) % 120;
  const buildings = Array.from({ length: 9 }, (_, index) => index);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #1e293b 0%, #334155 18%, #111827 42%, #111827 58%, #334155 82%, #1e293b 100%)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '37%', width: '26%', background: '#1f2937', boxShadow: 'inset 0 0 0 2px #475569' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '49.5%', width: 3, background: 'repeating-linear-gradient(180deg, #f8fafc 0 28px, transparent 28px 58px)' }} />
      {buildings.map((building) => (
        <div
          key={`left-building-${building}`}
          style={{
            position: 'absolute',
            left: `${5 + (building % 3) * 7}%`,
            top: `${(building * 82 - buildingOffset) % 600 - 80}px`,
            width: 54 + (building % 3) * 18,
            height: 74 + (building % 4) * 18,
            borderRadius: 8,
            background: building % 2 === 0 ? '#475569' : '#64748b',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        />
      ))}
      {buildings.map((building) => (
        <div
          key={`right-building-${building}`}
          style={{
            position: 'absolute',
            right: `${5 + (building % 3) * 7}%`,
            top: `${(building * 78 + 40 - buildingOffset) % 600 - 80}px`,
            width: 58 + (building % 4) * 14,
            height: 78 + (building % 3) * 20,
            borderRadius: 8,
            background: building % 2 === 0 ? '#334155' : '#475569',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </>
  );
}

function LidarOverlay({ frameIndex }: { frameIndex: number }) {
  const frame = getReplayFrame(replayFrames, frameIndex);

  return (
    <>
      {frame.lidarPoints.map((point, index) => (
        <span
          key={`${frame.id}-point-${index}`}
          style={{
            position: 'absolute',
            left: `${50 + point.y * 2.8}%`,
            top: `${82 - point.x * 1.55}%`,
            width: 4 + point.intensity * 5,
            height: 4 + point.intensity * 5,
            borderRadius: '50%',
            background: point.intensity >= 0.8 ? '#fde047' : '#38bdf8',
            opacity: 0.6 + point.intensity * 0.35,
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.75)',
          }}
        />
      ))}
    </>
  );
}

function RadarOverlay({ frameIndex }: { frameIndex: number }) {
  const frame = getReplayFrame(replayFrames, frameIndex);

  return (
    <>
      {frame.radarDetections.map((detection) => (
        <div
          key={detection.id}
          style={{
            position: 'absolute',
            left: `${50 + detection.azimuthDeg * 1.1}%`,
            top: `${80 - detection.rangeMeters * 1.35}%`,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid rgba(251, 146, 60, 0.92)',
            boxShadow: '0 0 18px rgba(251, 146, 60, 0.7)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </>
  );
}

function ObstacleOverlay({
  frameIndex,
  obstacleKindLabels,
}: {
  frameIndex: number;
  obstacleKindLabels: Record<ObstacleKind, string>;
}) {
  const frame = getReplayFrame(replayFrames, frameIndex);

  return (
    <>
      {frame.obstacles.map((obstacle) => {
        const risk = classifyObstacleRisk(obstacle.distanceMeters);

        return (
          <div
            key={obstacle.id}
            style={{
              position: 'absolute',
              left: `${50 + obstacle.laneOffsetMeters * 5.5}%`,
              top: `${78 - obstacle.distanceMeters * 2.2}%`,
              minWidth: 78,
              transform: 'translate(-50%, -50%)',
              padding: '5px 8px',
              borderRadius: 10,
              color: '#fff',
              background: risk === 'danger' ? 'rgba(220, 38, 38, 0.88)' : risk === 'watch' ? 'rgba(202, 138, 4, 0.9)' : 'rgba(22, 163, 74, 0.86)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              textAlign: 'center',
              fontSize: 12,
            }}
          >
            {obstacleKindLabels[obstacle.kind]}
          </div>
        );
      })}
    </>
  );
}

function EgoVehicle({ headingDeg }: { headingDeg: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 52,
        width: 54,
        height: 86,
        transform: `translateX(-50%) rotate(${headingDeg}deg)`,
        transformOrigin: '50% 75%',
        borderRadius: '18px 18px 12px 12px',
        background: 'linear-gradient(180deg, #818cf8 0%, #4338ca 100%)',
        boxShadow: '0 0 30px rgba(129, 140, 248, 0.85)',
      }}
    >
      <div style={{ position: 'absolute', left: 10, right: 10, top: 14, height: 20, borderRadius: 8, background: 'rgba(255,255,255,0.45)' }} />
      <div style={{ position: 'absolute', left: 8, right: 8, bottom: 12, height: 18, borderRadius: 8, background: 'rgba(15,23,42,0.45)' }} />
    </div>
  );
}
