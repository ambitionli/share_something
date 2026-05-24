# Admin Web — 自动驾驶 WebViz 回放

> 最后更新：2026-05-24 06:46 UTC

## 概述

`admin-web` 新增 `/webviz` 页面，用于演示自动驾驶系统的传感器回放界面：道路俯视图、自车轨迹、路侧建筑、障碍物、激光雷达点云和四路相机画面同步展示。

## 文件

| 路径 | 说明 |
|------|------|
| `admin-web/src/pages/WebvizReplay.tsx` | WebViz 页面，包含播放/暂停、时间轴、道路 SVG 场景、障碍物列表和相机画面卡片 |
| `admin-web/src/features/webviz/replayModel.ts` | 内置示例回放数据、点云生成、按时间取帧和统计汇总 |
| `admin-web/src/features/webviz/replayModel.test.ts` | Vitest 单元测试，覆盖回放数据、时间夹取、统计汇总 |
| `admin-web/src/App.tsx` | 注册 `/webviz` 受保护路由 |
| `admin-web/src/components/AdminLayout.tsx` | 新增“自动驾驶 WebViz”侧边栏入口 |
| `admin-web/src/i18n/zh-CN.ts` / `en-US.ts` | 新增 WebViz 中英文文案 |

## 行为

- 回放模型当前使用确定性的内置示例数据，便于无后端依赖地展示界面；未来可把 `createWebvizReplay()` 替换为接口或文件解析结果。
- 播放器每 450ms 推进 250ms，超过回放时长后回到起点循环播放。
- 俯视图用 SVG 表达道路、车道线、建筑物、障碍物、自车和点云；相机画面用四个同步卡片表达 front/left/right/rear 视频摘要和告警状态。

## 测试

- `npm run test -- src/features/webviz/replayModel.test.ts`
- `npm run build`
- `npm run lint`

## 修改记录

- 2026-05-24 06:42 UTC：新增自动驾驶 WebViz 回放页面、回放模型与测试。
- 2026-05-24 06:46 UTC：补充播放暂停状态与 WebViz 展示文案的 i18n 映射。
