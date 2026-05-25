#pragma once

#include "aeb_demo/common/frame_types.hpp"

#include <cstdint>

namespace aeb_demo {

struct SimpleAebConfig {
  std::uint32_t roi_x = 0U;
  std::uint32_t roi_y = 0U;
  std::uint32_t roi_width = 0U;
  std::uint32_t roi_height = 0U;
  std::uint8_t dark_pixel_threshold = 80U;
  float brake_ratio_threshold = 0.65F;
  std::uint32_t trigger_confirm_frames = 3U;
};

class SimpleAebAlgorithm {
 public:
  explicit SimpleAebAlgorithm(const SimpleAebConfig& config);

  AebDecision Process(const YuvFrame& frame);
  void Reset();

 private:
  bool IsValidRoi(const YuvFrame& frame) const;
  float ComputeDarkPixelRatio(const YuvFrame& frame) const;

  SimpleAebConfig config_;
  std::uint32_t consecutive_risk_frames_ = 0U;
};

}  // namespace aeb_demo
