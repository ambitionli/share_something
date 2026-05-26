#include "aeb_demo/algorithm/calibrated_aeb_algorithm.hpp"

#include <algorithm>

namespace aeb_demo {

namespace {

float ClampConfidence(const float value) {
  return std::max(0.0F, std::min(1.0F, value));
}

}  // namespace

CalibratedAebAlgorithm::CalibratedAebAlgorithm(
    const CalibratedAebConfig& config,
    const CameraCalibration& calibration)
    : config_(config), calibration_(calibration) {}

AebDecision CalibratedAebAlgorithm::Process(const YuvFrame& frame) {
  AebDecision decision;
  decision.frame_id = frame.frame_id;
  decision.timestamp_ns = frame.timestamp_ns;

  if (!IsValidCalibration(calibration_)) {
    consecutive_risk_frames_ = 0U;
    decision.should_brake = true;
    decision.confidence = 1.0F;
    decision.reason = "invalid_calibration";
    return decision;
  }

  if (!IsValidFrameAndRoi(frame)) {
    consecutive_risk_frames_ = 0U;
    decision.should_brake = true;
    decision.confidence = 1.0F;
    decision.reason = "invalid_frame_or_roi";
    return decision;
  }

  const float near_dark_ratio = ComputeNearDarkPixelRatio(frame);
  decision.confidence = ClampConfidence(
      near_dark_ratio / std::max(config_.near_pixel_ratio_threshold, 0.001F));

  if (near_dark_ratio >= config_.near_pixel_ratio_threshold) {
    ++consecutive_risk_frames_;
    if (consecutive_risk_frames_ >= config_.trigger_confirm_frames) {
      decision.should_brake = true;
      decision.reason = "calibrated_aeb_triggered";
      return decision;
    }

    decision.should_brake = false;
    decision.reason = "calibrated_risk_confirming";
    return decision;
  }

  consecutive_risk_frames_ = 0U;
  decision.should_brake = false;
  decision.confidence = 0.0F;
  decision.reason = "calibrated_roi_clear";
  return decision;
}

void CalibratedAebAlgorithm::Reset() {
  consecutive_risk_frames_ = 0U;
}

bool CalibratedAebAlgorithm::IsValidFrameAndRoi(const YuvFrame& frame) const {
  if (frame.format != PixelFormat::kNv12 && frame.format != PixelFormat::kYuv420) {
    return false;
  }

  if (frame.width == 0U || frame.height == 0U || frame.stride_y < frame.width) {
    return false;
  }

  if (frame.width != calibration_.image_width || frame.height != calibration_.image_height) {
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

float CalibratedAebAlgorithm::ComputeNearDarkPixelRatio(const YuvFrame& frame) const {
  std::uint64_t near_dark_pixels = 0U;
  std::uint64_t roi_pixels = 0U;

  for (std::uint32_t y = config_.roi_y; y < config_.roi_y + config_.roi_height; ++y) {
    double distance_m = 0.0;
    const bool has_ground_projection = ProjectPixelToGroundDistance(
        calibration_,
        static_cast<double>(config_.roi_x + (config_.roi_width / 2U)),
        static_cast<double>(y),
        &distance_m);

    const bool row_is_near =
        has_ground_projection && distance_m <= config_.near_obstacle_distance_m;
    const std::uint64_t row_offset = static_cast<std::uint64_t>(y) * frame.stride_y;

    for (std::uint32_t x = config_.roi_x; x < config_.roi_x + config_.roi_width; ++x) {
      const std::uint8_t luma = frame.y_plane[row_offset + x];
      if (row_is_near && luma <= config_.dark_pixel_threshold) {
        ++near_dark_pixels;
      }
      ++roi_pixels;
    }
  }

  if (roi_pixels == 0U) {
    return 1.0F;
  }

  return static_cast<float>(near_dark_pixels) / static_cast<float>(roi_pixels);
}

}  // namespace aeb_demo
