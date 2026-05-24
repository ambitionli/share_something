# Admin Web — 自动驾驶回放 Webviz

> 最后更新：2026-05-24

## 概述

`admin-web` 新增自动驾驶回放 Webviz 页面，用于演示车辆在城市道路中行驶时的融合感知回放。页面包含鸟瞰道路、主车、道路两侧建筑物、障碍物、激光雷达点云、毫米波雷达目标，以及四路 camera 录像卡片。

## 文件

| 路径 | 说明 |
|------|------|
| `admin-web/src/pages/AutonomousWebviz.tsx` | Webviz 页面，包含 BEV/LiDAR 视图、camera 面板、HUD 统计、播放/暂停与帧滑块 |
| `admin-web/src/utils/autonomousReplay.ts` | 合成回放场景、帧选择、LiDAR 点云、radar detections 与统计数据 |
| `admin-web/src/utils/autonomousReplay.test.ts` | Vitest 覆盖回放场景结构、帧边界、障碍物点云关联与 HUD 统计 |
| `admin-web/src/App.tsx` | 注册 `/webviz` 路由 |
| `admin-web/src/components/AdminLayout.tsx` | 侧边栏新增自动驾驶 Webviz 菜单入口 |
| `admin-web/src/i18n/zh-CN.ts` / `admin-web/src/i18n/en-US.ts` | 新增 `webviz.*` 中英文文案 |

## 行为

- 回放数据目前为前端合成数据，不依赖后端接口。
- 播放按钮每 900ms 前进一帧，末帧后自动回到首帧。
- 帧滑块可手动定位任意关键帧。
- HUD 显示车速、障碍物数量、点云点数、雷达目标数与最近障碍物距离。

## 测试

- `npm run test -- src/utils/autonomousReplay.test.ts`
- `npm run test`
- `npm run build`
