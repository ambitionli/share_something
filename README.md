# Autonomous Webviz

A standalone React + TypeScript + Vite demo for autonomous-driving replay visualization.

This project is independent from the original workspace application. It contains its own Git repository, package manifest, source code, tests, and build setup.

## Features

- Birdseye road replay with an ego vehicle driving through an urban lane.
- Buildings on both sides of the road.
- Multiple obstacle types: vehicle, pedestrian, cones, barrier, cyclist.
- LiDAR point cloud rendering.
- Radar detections with range rays and target rings.
- Four synchronized camera feeds: front, left, right, rear.
- Playback controls with play/pause, frame slider, progress indicator, and scenario stats.

## Getting started

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Scripts

```bash
npm run test
npm run build
npm run lint
```

## Project structure

```text
src/
  App.tsx                 # Webviz UI and playback controls
  App.css                 # Standalone dashboard styling
  replayScenario.ts       # Synthetic replay data and frame utilities
  replayScenario.test.ts  # Data/model tests
  App.test.tsx            # UI smoke test
```
