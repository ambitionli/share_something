# Admin Web — 自动驾驶 WebViz 回放

> 最后更新：2026-05-24（新增自动驾驶传感器回放页面）

## 概述

`admin-web` 新增 `/autonomy-webviz` 页面，用于演示自动驾驶系统回放界面：

- 主场景：道路、自车、道路两侧建筑物、车道线、障碍物和 LiDAR 点云。
- 回放控制：播放/暂停、时间轴拖动、当前时间与总时长显示。
- 传感器状态：自车速度、点云点数、障碍物数量、相机数量。
- 相机面板：四路模拟录像机画面（前广角、前窄角、左侧、右侧），按视角展示相关障碍物标签。

## 文件

| 路径 | 说明 |
|------|------|
| `admin-web/src/pages/AutonomyWebViz.tsx` | WebViz 页面、SVG 道路场景、点云和相机面板 |
| `admin-web/src/utils/autonomyReplay.ts` | 模拟回放数据、取帧、点云展开、统计汇总 |
| `admin-web/src/utils/autonomyReplay.test.ts` | 回放数据与点云采样单元测试 |
| `admin-web/src/App.tsx` | 注册 `/autonomy-webviz` 路由 |
| `admin-web/src/components/AdminLayout.tsx` | 侧边栏新增“自动驾驶回放”入口 |
| `admin-web/src/i18n/zh-CN.ts` / `en-US.ts` | 新增 `autonomy.*` 中英文文案，包含相机名与障碍物标签 |

## 测试

- `npm run test -- src/utils/autonomyReplay.test.ts`：验证回放取帧、统计汇总、时间格式与 LiDAR 点云采样。
- `npm run test`：运行 admin-web 全量 Vitest。
- `npm run build`：TypeScript 与 Vite 构建验证。

## 修改记录

- 2026-05-24：将相机名、障碍物标签和相机数量后缀纳入 i18n；更新时间戳：2026-05-24 06:49 UTC。
- 2026-05-24：新增自动驾驶 WebViz 回放页面和模拟传感器数据；更新时间戳：2026-05-24 06:43 UTC。
