#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace aeb_demo {

enum class PixelFormat : std::uint8_t {
  kNv12 = 0U,
  kYuv420 = 1U,
};

struct H264Frame {
  std::uint64_t frame_id = 0U;
  std::uint64_t timestamp_ns = 0U;
  std::vector<std::uint8_t> data;
  bool is_key_frame = false;
};

struct YuvFrame {
  std::uint64_t frame_id = 0U;
  std::uint64_t timestamp_ns = 0U;
  std::uint32_t width = 0U;
  std::uint32_t height = 0U;
  std::uint32_t stride_y = 0U;
  std::uint32_t stride_uv = 0U;
  PixelFormat format = PixelFormat::kNv12;
  std::vector<std::uint8_t> y_plane;
  std::vector<std::uint8_t> uv_plane;
};

struct AebDecision {
  std::uint64_t frame_id = 0U;
  std::uint64_t timestamp_ns = 0U;
  bool should_brake = false;
  float confidence = 0.0F;
  std::string reason;
};

}  // namespace aeb_demo
