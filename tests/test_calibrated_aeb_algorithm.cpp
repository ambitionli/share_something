#include "aeb_demo/algorithm/calibrated_aeb_algorithm.hpp"

#include <cassert>
#include <cstdint>

namespace {

aeb_demo::CameraCalibration MakeCalibration() {
  aeb_demo::CameraCalibration calibration;
  calibration.image_width = 16U;
  calibration.image_height = 16U;
  calibration.fx = 10.0;
  calibration.fy = 10.0;
  calibration.cx = 8.0;
  calibration.cy = 8.0;
  calibration.camera_height_m = 1.0;
  calibration.pitch_down_rad = 0.20;
  return calibration;
}

aeb_demo::YuvFrame MakeFrame() {
  aeb_demo::YuvFrame frame;
  frame.frame_id = 1U;
  frame.timestamp_ns = 1000U;
  frame.width = 16U;
  frame.height = 16U;
  frame.stride_y = 16U;
  frame.stride_uv = 16U;
  frame.format = aeb_demo::PixelFormat::kNv12;
  frame.y_plane.assign(256U, 220U);
  frame.uv_plane.assign(128U, 128U);
  return frame;
}

aeb_demo::CalibratedAebConfig MakeConfig() {
  aeb_demo::CalibratedAebConfig config;
  config.roi_x = 4U;
  config.roi_y = 8U;
  config.roi_width = 8U;
  config.roi_height = 8U;
  config.dark_pixel_threshold = 80U;
  config.near_obstacle_distance_m = 4.0;
  config.near_pixel_ratio_threshold = 0.50F;
  config.trigger_confirm_frames = 2U;
  return config;
}

void BrightFrameDoesNotBrake() {
  aeb_demo::CalibratedAebAlgorithm algorithm(MakeConfig(), MakeCalibration());

  const aeb_demo::AebDecision decision = algorithm.Process(MakeFrame());

  assert(!decision.should_brake);
  assert(decision.reason == "calibrated_roi_clear");
}

void NearDarkRegionRequiresConsecutiveFrames() {
  aeb_demo::CalibratedAebAlgorithm algorithm(MakeConfig(), MakeCalibration());
  aeb_demo::YuvFrame frame = MakeFrame();

  for (std::uint32_t y = 12U; y < 16U; ++y) {
    for (std::uint32_t x = 4U; x < 12U; ++x) {
      frame.y_plane[(y * frame.stride_y) + x] = 20U;
    }
  }

  const aeb_demo::AebDecision first = algorithm.Process(frame);
  const aeb_demo::AebDecision second = algorithm.Process(frame);

  assert(!first.should_brake);
  assert(first.reason == "calibrated_risk_confirming");
  assert(second.should_brake);
  assert(second.reason == "calibrated_aeb_triggered");
}

void FarDarkRegionDoesNotBrake() {
  aeb_demo::CalibratedAebAlgorithm algorithm(MakeConfig(), MakeCalibration());
  aeb_demo::YuvFrame frame = MakeFrame();

  for (std::uint32_t y = 8U; y < 10U; ++y) {
    for (std::uint32_t x = 4U; x < 12U; ++x) {
      frame.y_plane[(y * frame.stride_y) + x] = 20U;
    }
  }

  const aeb_demo::AebDecision decision = algorithm.Process(frame);

  assert(!decision.should_brake);
  assert(decision.reason == "calibrated_roi_clear");
}

void InvalidCalibrationFailsSafe() {
  aeb_demo::CameraCalibration calibration = MakeCalibration();
  calibration.fx = 0.0;
  aeb_demo::CalibratedAebAlgorithm algorithm(MakeConfig(), calibration);

  const aeb_demo::AebDecision decision = algorithm.Process(MakeFrame());

  assert(decision.should_brake);
  assert(decision.reason == "invalid_calibration");
}

}  // namespace

int main() {
  BrightFrameDoesNotBrake();
  NearDarkRegionRequiresConsecutiveFrames();
  FarDarkRegionDoesNotBrake();
  InvalidCalibrationFailsSafe();
  return 0;
}
