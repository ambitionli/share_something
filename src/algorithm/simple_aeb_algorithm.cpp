#include "aeb_demo/algorithm/simple_aeb_algorithm.hpp"

#include <algorithm>

namespace aeb_demo {

namespace {

float ClampConfidence(const float value) {
  return std::max(0.0F, std::min(1.0F, value));
}

}  // namespace

SimpleAebAlgorithm::SimpleAebAlgorithm(const SimpleAebConfig& config)
    : config_(config) {}

AebDecision SimpleAebAlgorithm::Process(const YuvFrame& frame) {
  AebDecision decision;
  decision.frame_id = frame.frame_id;
  decision.timestamp_ns = frame.timestamp_ns;

  if (!IsValidRoi(frame)) {
    consecutive_risk_frames_ = 0U;
    decision.should_brake = true;
    decision.confidence = 1.0F;
    decision.reason = "invalid_roi";
    return decision;
  }

  const float dark_ratio = ComputeDarkPixelRatio(frame);
  decision.confidence = ClampConfidence(dark_ratio);

  if (dark_ratio >= config_.brake_ratio_threshold) {
    ++consecutive_risk_frames_;
    if (consecutive_risk_frames_ >= config_.trigger_confirm_frames) {
      decision.should_brake = true;
      decision.reason = "aeb_triggered";
      return decision;
    }

    decision.should_brake = false;
    decision.reason = "risk_confirming";
    return decision;
  }

  consecutive_risk_frames_ = 0U;
  decision.should_brake = false;
  decision.confidence = 0.0F;
  decision.reason = "roi_clear";
  return decision;
}

void SimpleAebAlgorithm::Reset() {
  consecutive_risk_frames_ = 0U;
}

bool SimpleAebAlgorithm::IsValidRoi(const YuvFrame& frame) const {
  if (frame.format != PixelFormat::kNv12 && frame.format != PixelFormat::kYuv420) {
    return false;
  }

  if (frame.width == 0U || frame.height == 0U || frame.stride_y < frame.width) {
    return false;
  }

  if (config_.roi_width == 0U || config_.roi_height == 0U) {
    return false;
  }

  if (config_.roi_x > frame.width || config_.roi_y > frame.height) {
    return false;
  }

  const std::uint64_t roi_right =
      static_cast<std::uint64_t>(config_.roi_x) + config_.roi_width;
  const std::uint64_t roi_bottom =
      static_cast<std::uint64_t>(config_.roi_y) + config_.roi_height;

  if (roi_right > frame.width || roi_bottom > frame.height) {
    return false;
  }

  const std::uint64_t required_y_size =
      (static_cast<std::uint64_t>(frame.height - 1U) * frame.stride_y) + frame.width;
  return frame.y_plane.size() >= required_y_size;
}

float SimpleAebAlgorithm::ComputeDarkPixelRatio(const YuvFrame& frame) const {
  std::uint64_t dark_pixels = 0U;
  std::uint64_t total_pixels = 0U;

  for (std::uint32_t y = config_.roi_y; y < config_.roi_y + config_.roi_height; ++y) {
    const std::uint64_t row_offset = static_cast<std::uint64_t>(y) * frame.stride_y;
    for (std::uint32_t x = config_.roi_x; x < config_.roi_x + config_.roi_width; ++x) {
      const std::uint8_t luma = frame.y_plane[row_offset + x];
      if (luma <= config_.dark_pixel_threshold) {
        ++dark_pixels;
      }
      ++total_pixels;
    }
  }

  if (total_pixels == 0U) {
    return 1.0F;
  }

  return static_cast<float>(dark_pixels) / static_cast<float>(total_pixels);
}

}  // namespace aeb_demo
