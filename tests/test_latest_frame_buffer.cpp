#include "aeb_demo/common/latest_frame_buffer.hpp"

#include <cassert>
#include <cstdint>
#include <vector>

namespace {

aeb_demo::YuvFrame MakeFrame(const std::uint64_t frame_id, const std::uint8_t value) {
  aeb_demo::YuvFrame frame;
  frame.frame_id = frame_id;
  frame.timestamp_ns = 1000U + frame_id;
  frame.width = 4U;
  frame.height = 4U;
  frame.stride_y = 4U;
  frame.stride_uv = 4U;
  frame.format = aeb_demo::PixelFormat::kNv12;
  frame.y_plane.assign(16U, value);
  frame.uv_plane.assign(8U, 128U);
  return frame;
}

void EmptyBufferReturnsFalse() {
  aeb_demo::LatestFrameBuffer buffer;
  aeb_demo::YuvFrame frame;

  assert(!buffer.ReadLatest(&frame));
}

void ReadLatestReturnsNewestFrameOnly() {
  aeb_demo::LatestFrameBuffer buffer;

  buffer.Write(MakeFrame(1U, 10U));
  buffer.Write(MakeFrame(2U, 20U));

  aeb_demo::YuvFrame latest;
  assert(buffer.ReadLatest(&latest));
  assert(latest.frame_id == 2U);
  assert(latest.y_plane.size() == 16U);
  assert(latest.y_plane[0] == 20U);
}

void NullReadPointerReturnsFalse() {
  aeb_demo::LatestFrameBuffer buffer;

  buffer.Write(MakeFrame(3U, 30U));

  assert(!buffer.ReadLatest(nullptr));
}

}  // namespace

int main() {
  EmptyBufferReturnsFalse();
  ReadLatestReturnsNewestFrameOnly();
  NullReadPointerReturnsFalse();
  return 0;
}
