import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'
import {
  getFrame,
  getFrameStats,
  replayScenario,
} from './replayScenario'
import type { BuildingModel, ObstacleModel, ReplayFrame } from './replayScenario'

const riskColors: Record<ObstacleModel['risk'], string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
}

const obstacleShortLabels: Record<ObstacleModel['type'], string> = {
  vehicle: 'CAR',
  pedestrian: 'PED',
  cone: 'CONE',
  barrier: 'BAR',
  cyclist: 'BIKE',
}

function formatTimestamp(timestampMs: number): string {
  return `${(timestampMs / 1000).toFixed(1)}s`
}

function xToView(x: number): number {
  return 260 + x * 18
}

function yToView(relativeY: number): number {
  return 410 - relativeY * 7.2
}

function buildingRect(building: BuildingModel, frame: ReplayFrame) {
  const relativeY = building.worldY - frame.ego.worldY
  const width = building.width * 5
  const height = building.height * 1.2
  const x = building.side === 'left' ? 18 : 502 - width

  return {
    x,
    y: yToView(relativeY) - height / 2,
    width,
    height,
  }
}

function BirdseyeView({ frame }: { frame: ReplayFrame }) {
  const visibleBuildings = replayScenario.buildings.filter((building) => {
    const relativeY = building.worldY - frame.ego.worldY
    return relativeY > -24 && relativeY < 58
  })

  return (
    <section className="panel bev-panel" aria-labelledby="bev-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Birdseye playback</p>
          <h2 id="bev-title">LiDAR / Radar / BEV</h2>
        </div>
        <span className="badge">{formatTimestamp(frame.timestampMs)}</span>
      </div>
      <svg viewBox="0 0 520 460" role="img" aria-label="Autonomous replay birdseye view">
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
          const rect = buildingRect(building, frame)

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
                BUILDING
              </text>
            </g>
          )
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
          const angleRadians = detection.angleDegrees * (Math.PI / 180)
          const originX = xToView(frame.ego.x)
          const originY = 410
          const x = originX + Math.sin(angleRadians) * detection.rangeMeters * 18
          const y = originY - Math.cos(angleRadians) * detection.rangeMeters * 7.2

          return (
            <g key={detection.id}>
              <line x1={originX} y1={originY} x2={x} y2={y} className="radar-ray" />
              <circle cx={x} cy={y} r="7" className="radar-ring" />
              <circle cx={x} cy={y} r="2.5" className="radar-dot" />
            </g>
          )
        })}

        {frame.visibleObstacles.map((obstacle) => {
          const relativeY = obstacle.worldY - frame.ego.worldY
          const x = xToView(obstacle.x)
          const y = yToView(relativeY)

          return (
            <g key={obstacle.id}>
              <rect
                x={x - obstacle.width * 9}
                y={y - obstacle.length * 6}
                width={obstacle.width * 18}
                height={Math.max(obstacle.length * 12, 18)}
                rx="6"
                fill={riskColors[obstacle.risk]}
                opacity="0.88"
                stroke="#fff7ed"
                strokeWidth="1.5"
              />
              <text x={x} y={y + 4} textAnchor="middle" fill="#111827" fontSize="10" fontWeight="700">
                {obstacleShortLabels[obstacle.type]}
              </text>
            </g>
          )
        })}

        <g transform={`translate(${xToView(frame.ego.x)} 410) rotate(${frame.ego.headingDegrees})`}>
          <path d="M0 -30 L17 18 L0 28 L-17 18 Z" fill="#6366f1" stroke="#eef2ff" strokeWidth="2" />
          <circle cx="0" cy="-4" r="48" fill="none" stroke="#818cf8" strokeDasharray="6 8" opacity="0.45" />
          <text x="0" y="48" textAnchor="middle" fill="#c7d2fe" fontSize="12">
            EGO
          </text>
        </g>
      </svg>
    </section>
  )
}

function CameraPanel({ feedIndex, frame }: { feedIndex: number; frame: ReplayFrame }) {
  const feed = frame.cameraFeeds[feedIndex]
  const tint = ['#38bdf8', '#a78bfa', '#34d399', '#f97316'][feedIndex]
  const cameraConfig = replayScenario.cameras.find((camera) => camera.id === feed.cameraId)

  return (
    <article className="camera-card">
      <div className="camera-card-header">
        <h3>{feed.title}</h3>
        <span>REC</span>
      </div>
      <div className="camera-screen" style={{ '--camera-tint': tint } as CSSProperties}>
        <span className="camera-frame">
          Frame {String(frame.frameIndex + 1).padStart(2, '0')} | FOV {cameraConfig?.fovDegrees ?? 0}deg
        </span>
        <div className="camera-lane" />
        {frame.visibleObstacles.slice(0, 3).map((obstacle, index) => (
          <span
            key={`${feed.cameraId}-${obstacle.id}`}
            className={`camera-detection risk-${obstacle.risk}`}
            style={{ left: `${26 + index * 18}%`, top: `${32 + index * 11}%` }}
          >
            {obstacle.label}
          </span>
        ))}
        <span className="camera-objects">{feed.detectedObstacleIds.length} objects</span>
      </div>
    </article>
  )
}

function App() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const frame = getFrame(frameIndex)
  const stats = useMemo(() => getFrameStats(frame), [frame])
  const maxFrame = replayScenario.frames.length - 1
  const progressPercent = Math.round((frame.frameIndex / maxFrame) * 100)

  useEffect(() => {
    if (!playing) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setFrameIndex((currentFrameIndex) => (currentFrameIndex >= maxFrame ? 0 : currentFrameIndex + 1))
    }, 900)

    return () => window.clearInterval(timer)
  }, [maxFrame, playing])

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Standalone demo project</p>
          <h1>Autonomous Driving Webviz</h1>
          <p className="hero-copy">
            Replay a vehicle driving through an urban road with buildings, obstacles, LiDAR point clouds,
            radar detections, and four synchronized camera feeds.
          </p>
        </div>
        <div className="hero-status">
          <span>Scenario: downtown lane</span>
          <strong>{formatTimestamp(frame.timestampMs)}</strong>
        </div>
      </section>

      <section className="stats-grid" aria-label="Replay statistics">
        <article><span>Speed</span><strong>{stats.speedKph} km/h</strong></article>
        <article><span>Obstacles</span><strong>{stats.obstacleCount}</strong></article>
        <article><span>LiDAR points</span><strong>{stats.lidarPointCount}</strong></article>
        <article><span>Radar detections</span><strong>{stats.radarDetectionCount}</strong></article>
        <article><span>Nearest object</span><strong>{stats.nearestObstacleMeters} m</strong></article>
        <article><span>Cameras</span><strong>{stats.cameraCount}</strong></article>
      </section>

      <section className="visual-grid">
        <BirdseyeView frame={frame} />
        <section className="camera-grid" aria-label="Camera feeds">
          {frame.cameraFeeds.map((feed, index) => (
            <CameraPanel key={feed.cameraId} feedIndex={index} frame={frame} />
          ))}
        </section>
      </section>

      <section className="controls-panel" aria-label="Replay controls">
        <button type="button" onClick={() => setPlaying((current) => !current)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <div className="timeline">
          <div className="timeline-labels">
            <span>
              Frame {frame.frameIndex + 1}/{replayScenario.frames.length}
            </span>
            <span>{formatTimestamp(frame.timestampMs)}</span>
          </div>
          <input
            aria-label="Replay frame"
            type="range"
            min="0"
            max={maxFrame}
            value={frameIndex}
            onChange={(event) => setFrameIndex(Number(event.target.value))}
          />
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
