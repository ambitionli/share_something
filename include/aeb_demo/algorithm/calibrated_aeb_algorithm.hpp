#pragma once

#include "aeb_demo/common/camera_calibration.hpp"
#include "aeb_demo/common/frame_types.hpp"

#include <cstdint>

namespace aeb_demo {

struct CalibratedAebConfig {
  std::uint32_t roi_x = 0U;
  std::uint32_t roi_y = 0U;
  std::uint32_t roi_width = 0U;
  std::uint32_t roi_height = 0U;
  std::uint8_t dark_pixel_threshold = 80U;
  double near_obstacle_distance_m = 8.0;
  float near_pixel_ratio_threshold = 0.20F;
  std::uint32_t trigger_confirm_frames = 3U;
};

class CalibratedAebAlgorithm {
 public:
  CalibratedAebAlgorithm(
      const CalibratedAebConfig& config,
      const CameraCalibration& calibration);

  AebDecision Process(const YuvFrame& frame);
  void Reset();

 private:
  bool IsValidFrameAndRoi(const YuvFrame& frame) const;
  float ComputeNearDarkPixelRatio(const YuvFrame& frame) const;

  CalibratedAebConfig config_;
  CameraCalibration calibration_;
  std::uint32_t consecutive_risk_frames_ = 0U;
};

}  // namespace aeb_demo
