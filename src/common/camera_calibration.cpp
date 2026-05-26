#include "aeb_demo/common/camera_calibration.hpp"

#include <cmath>
#include <cstddef>
#include <fstream>
#include <map>
#include <sstream>
#include <string>

namespace aeb_demo {

namespace {

constexpr double kPi = 3.14159265358979323846;
constexpr double kMinRayAngleRad = 1e-4;

std::string Trim(const std::string& input) {
  const std::size_t first = input.find_first_not_of(" \t\r\n");
  if (first == std::string::npos) {
    return "";
  }

  const std::size_t last = input.find_last_not_of(" \t\r\n");
  return input.substr(first, last - first + 1U);
}

std::map<std::string, double> ParseKeyValueFile(const std::string& path) {
  std::ifstream input(path);
  std::map<std::string, double> values;
  if (!input) {
    return values;
  }

  std::string line;
  while (std::getline(input, line)) {
    const std::size_t comment_pos = line.find('#');
    if (comment_pos != std::string::npos) {
      line = line.substr(0U, comment_pos);
    }

    const std::size_t colon_pos = line.find(':');
    if (colon_pos == std::string::npos) {
      continue;
    }

    const std::string key = Trim(line.substr(0U, colon_pos));
    const std::string value_text = Trim(line.substr(colon_pos + 1U));
    if (key.empty() || value_text.empty()) {
      continue;
    }

    std::istringstream value_stream(value_text);
    double value = 0.0;
    value_stream >> value;
    if (!value_stream.fail()) {
      values[key] = value;
    }
  }

  return values;
}

bool HasKey(const std::map<std::string, double>& values, const std::string& key) {
  return values.find(key) != values.end();
}

}  // namespace

bool IsValidCalibration(const CameraCalibration& calibration) {
  if (calibration.image_width == 0U || calibration.image_height == 0U) {
    return false;
  }

  if (calibration.fx <= 0.0 || calibration.fy <= 0.0) {
    return false;
  }

  if (calibration.cx < 0.0 || calibration.cy < 0.0) {
    return false;
  }

  if (calibration.camera_height_m <= 0.0) {
    return false;
  }

  if (calibration.pitch_down_rad <= 0.0 || calibration.pitch_down_rad >= (kPi / 2.0)) {
    return false;
  }

  return true;
}

bool LoadCameraCalibration(
    const std::string& calibration_path,
    CameraCalibration* calibration) {
  if (calibration == nullptr) {
    return false;
  }

  const std::map<std::string, double> values = ParseKeyValueFile(calibration_path);
  const bool has_required_fields =
      HasKey(values, "image_width") &&
      HasKey(values, "image_height") &&
      HasKey(values, "fx") &&
      HasKey(values, "fy") &&
      HasKey(values, "cx") &&
      HasKey(values, "cy") &&
      HasKey(values, "camera_height_m") &&
      (HasKey(values, "pitch_down_rad") || HasKey(values, "pitch_down_deg"));
  if (!has_required_fields) {
    return false;
  }

  CameraCalibration parsed;
  parsed.image_width = static_cast<std::uint32_t>(values.at("image_width"));
  parsed.image_height = static_cast<std::uint32_t>(values.at("image_height"));
  parsed.fx = values.at("fx");
  parsed.fy = values.at("fy");
  parsed.cx = values.at("cx");
  parsed.cy = values.at("cy");
  parsed.camera_height_m = values.at("camera_height_m");
  if (HasKey(values, "pitch_down_rad")) {
    parsed.pitch_down_rad = values.at("pitch_down_rad");
  } else {
    parsed.pitch_down_rad = values.at("pitch_down_deg") * kPi / 180.0;
  }

  if (!IsValidCalibration(parsed)) {
    return false;
  }

  *calibration = parsed;
  return true;
}

bool LoadCameraCalibration(
    const std::string& intrinsic_path,
    const std::string& extrinsic_path,
    CameraCalibration* calibration) {
  if (calibration == nullptr) {
    return false;
  }

  const std::map<std::string, double> intrinsic_values = ParseKeyValueFile(intrinsic_path);
  const std::map<std::string, double> extrinsic_values = ParseKeyValueFile(extrinsic_path);
  const bool has_intrinsic_fields =
      HasKey(intrinsic_values, "image_width") &&
      HasKey(intrinsic_values, "image_height") &&
      HasKey(intrinsic_values, "fx") &&
      HasKey(intrinsic_values, "fy") &&
      HasKey(intrinsic_values, "cx") &&
      HasKey(intrinsic_values, "cy");
  const bool has_extrinsic_fields =
      HasKey(extrinsic_values, "camera_height_m") &&
      (HasKey(extrinsic_values, "pitch_down_rad") ||
       HasKey(extrinsic_values, "pitch_down_deg"));
  if (!has_intrinsic_fields || !has_extrinsic_fields) {
    return false;
  }

  CameraCalibration parsed;
  parsed.image_width = static_cast<std::uint32_t>(intrinsic_values.at("image_width"));
  parsed.image_height = static_cast<std::uint32_t>(intrinsic_values.at("image_height"));
  parsed.fx = intrinsic_values.at("fx");
  parsed.fy = intrinsic_values.at("fy");
  parsed.cx = intrinsic_values.at("cx");
  parsed.cy = intrinsic_values.at("cy");
  parsed.camera_height_m = extrinsic_values.at("camera_height_m");
  if (HasKey(extrinsic_values, "pitch_down_rad")) {
    parsed.pitch_down_rad = extrinsic_values.at("pitch_down_rad");
  } else {
    parsed.pitch_down_rad = extrinsic_values.at("pitch_down_deg") * kPi / 180.0;
  }

  if (!IsValidCalibration(parsed)) {
    return false;
  }

  *calibration = parsed;
  return true;
}

bool ProjectPixelToGroundDistance(
    const CameraCalibration& calibration,
    const double pixel_x,
    const double pixel_y,
    double* longitudinal_distance_m) {
  (void)pixel_x;
  if (longitudinal_distance_m == nullptr || !IsValidCalibration(calibration)) {
    return false;
  }

  if (pixel_y < 0.0 || pixel_y >= static_cast<double>(calibration.image_height)) {
    return false;
  }

  const double vertical_angle_from_optical_axis =
      std::atan((pixel_y - calibration.cy) / calibration.fy);
  const double ray_down_angle = calibration.pitch_down_rad + vertical_angle_from_optical_axis;
  if (ray_down_angle <= kMinRayAngleRad || ray_down_angle >= (kPi / 2.0)) {
    return false;
  }

  *longitudinal_distance_m = calibration.camera_height_m / std::tan(ray_down_angle);
  return std::isfinite(*longitudinal_distance_m) && *longitudinal_distance_m > 0.0;
}

}  // namespace aeb_demo
