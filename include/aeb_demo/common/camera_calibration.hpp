#pragma once

#include <cstdint>
#include <string>

namespace aeb_demo {

struct CameraCalibration {
  std::uint32_t image_width = 0U;
  std::uint32_t image_height = 0U;
  double fx = 0.0;
  double fy = 0.0;
  double cx = 0.0;
  double cy = 0.0;
  double camera_height_m = 0.0;
  double pitch_down_rad = 0.0;
};

bool IsValidCalibration(const CameraCalibration& calibration);

bool LoadCameraCalibration(
    const std::string& calibration_path,
    CameraCalibration* calibration);

bool LoadCameraCalibration(
    const std::string& intrinsic_path,
    const std::string& extrinsic_path,
    CameraCalibration* calibration);

bool ProjectPixelToGroundDistance(
    const CameraCalibration& calibration,
    double pixel_x,
    double pixel_y,
    double* longitudinal_distance_m);

}  // namespace aeb_demo
