# AEB Demo 自动记录

> 最后更新：2026-05-25 14:52 UTC

## 目标

实现普通 AEB demo：

- 输入：UDP 传输的 30Hz H.264 全 I 帧。
- 平台：NVIDIA Orin。
- 解码：GStreamer `nvv4l2decoder` 硬解码为 NV12/YUV。
- 输出：是否杀停的 AEB decision。

## 架构

参考 Apollo 的模块化思想，拆分为：

- `common`：帧类型、AEB 决策、latest-frame buffer。
- `transport`：Annex-B H.264 I 帧解析、UDP debug packet、UDP receiver、frame reassembler。
- `decoder`：H.264 decoder 抽象与 Orin GStreamer 硬解码后端。
- `algorithm`：可测试的 ROI luma AEB 规则算法。
- `node`：ROS2 节点骨架。
- `tools`：H.264 文件 UDP debug sender。

## 验证

当前本机默认构建不依赖 ROS2/GStreamer，已覆盖：

- latest-frame buffer。
- simple AEB algorithm。
- Annex-B parser。
- UDP frame reassembler。
- UDP packet deserialize。

## 修改时间

- 2026-05-25 14:52 UTC：创建 AEB demo 架构、核心库、UDP debug sender、Orin/ROS2 可选骨架。
