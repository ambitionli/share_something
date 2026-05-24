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
  type CameraDirection,
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

function riskLabel(risk: ObstacleRisk): string {
  if (risk === 'danger') {
    return '高风险';
  }

  if (risk === 'watch') {
    return '关注';
  }

  return '正常';
}

export default function AutonomousWebviz() {
  const { t } = useTranslation();
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentFrame = getReplayFrame(replayFrames, frameIndex);
  const pointCloudSummary = useMemo(() => summarizePointCloud(currentFrame.lidarPoints), [currentFrame]);

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
                <ObstacleOverlay frameIndex={frameIndex} />
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

              <Card title={t('webviz.obstacleTracking')}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {currentFrame.obstacles.map((obstacle) => {
                    const risk = classifyObstacleRisk(obstacle.distanceMeters);

                    return (
                      <div key={obstacle.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <Text strong>{obstacle.label}</Text>
                          <div><Text type="secondary">{obstacle.kind} · {obstacle.velocityKph} km/h</Text></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Tag color={riskColors[risk]}>{riskLabel(risk)}</Tag>
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
                    <div style={{ position: 'absolute', left: 28, right: 28, bottom: 30, height: 42, transform: 'skewX(-16deg)', background: 'rgba(15, 23, 42, 0.55)' }} />
                    <div style={{ position: 'absolute', left: '42%', bottom: 34, width: 46, height: 24, borderRadius: 6, background: 'rgba(248, 250, 252, 0.75)' }} />
                    <Text style={{ position: 'absolute', left: 16, top: 12, color: '#fff', fontWeight: 600 }}>{camera.label}</Text>
                    <Text style={{ position: 'absolute', right: 16, top: 12, color: '#dbeafe' }}>{camera.exposure}</Text>
                  </div>
                  <div style={{ padding: 12 }}>
                    <Text type="secondary">{t('webviz.detected')}: </Text>
                    {camera.detectedObjects.map((object) => (
                      <Tag key={object} color="geekblue">{object}</Tag>
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

function ObstacleOverlay({ frameIndex }: { frameIndex: number }) {
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
            {obstacle.label}
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
