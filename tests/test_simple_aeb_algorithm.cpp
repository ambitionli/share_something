#include "aeb_demo/algorithm/simple_aeb_algorithm.hpp"

#include <cassert>
#include <cstdint>

namespace {

aeb_demo::YuvFrame MakeNv12Frame(const std::uint8_t roi_value) {
  aeb_demo::YuvFrame frame;
  frame.frame_id = 42U;
  frame.timestamp_ns = 9000000U;
  frame.width = 8U;
  frame.height = 8U;
  frame.stride_y = 8U;
  frame.stride_uv = 8U;
  frame.format = aeb_demo::PixelFormat::kNv12;
  frame.y_plane.assign(64U, 200U);
  frame.uv_plane.assign(32U, 128U);

  for (std::uint32_t y = 4U; y < 8U; ++y) {
    for (std::uint32_t x = 2U; x < 6U; ++x) {
      frame.y_plane[(y * frame.stride_y) + x] = roi_value;
    }
  }

  return frame;
}

aeb_demo::SimpleAebConfig MakeConfig() {
  aeb_demo::SimpleAebConfig config;
  config.roi_x = 2U;
  config.roi_y = 4U;
  config.roi_width = 4U;
  config.roi_height = 4U;
  config.dark_pixel_threshold = 80U;
  config.brake_ratio_threshold = 0.75F;
  config.trigger_confirm_frames = 2U;
  return config;
}

void BrightRoiDoesNotBrake() {
  aeb_demo::SimpleAebAlgorithm algorithm(MakeConfig());

  const aeb_demo::AebDecision decision = algorithm.Process(MakeNv12Frame(220U));

  assert(!decision.should_brake);
  assert(decision.confidence == 0.0F);
  assert(decision.reason == "roi_clear");
}

void DarkRoiRequiresConsecutiveFrames() {
  aeb_demo::SimpleAebAlgorithm algorithm(MakeConfig());

  const aeb_demo::AebDecision first = algorithm.Process(MakeNv12Frame(20U));
  const aeb_demo::AebDecision second = algorithm.Process(MakeNv12Frame(20U));

  assert(!first.should_brake);
  assert(first.reason == "risk_confirming");
  assert(second.should_brake);
  assert(second.confidence >= 0.99F);
  assert(second.reason == "aeb_triggered");
}

void InvalidRoiFailsSafe() {
  aeb_demo::SimpleAebConfig config = MakeConfig();
  config.roi_x = 100U;
  aeb_demo::SimpleAebAlgorithm algorithm(config);

  const aeb_demo::AebDecision decision = algorithm.Process(MakeNv12Frame(220U));

  assert(decision.should_brake);
  assert(decision.reason == "invalid_roi");
}

}  // namespace

int main() {
  BrightRoiDoesNotBrake();
  DarkRoiRequiresConsecutiveFrames();
  InvalidRoiFailsSafe();
  return 0;
}
