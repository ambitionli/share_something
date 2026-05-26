#include "aeb_demo/common/camera_calibration.hpp"

#include <cassert>
#include <cmath>
#include <fstream>
#include <string>

namespace {

std::string WriteCalibrationFile() {
  const std::string path = "/tmp/aeb_camera_calibration_test.yaml";
  std::ofstream output(path);
  output << "# demo camera calibration\n";
  output << "image_width: 1920\n";
  output << "image_height: 1536\n";
  output << "fx: 1100.0\n";
  output << "fy: 1100.0\n";
  output << "cx: 960.0\n";
  output << "cy: 768.0\n";
  output << "camera_height_m: 1.4\n";
  output << "pitch_down_deg: 8.0\n";
  return path;
}

void LoadsYamlLikeCalibrationFile() {
  aeb_demo::CameraCalibration calibration;

  assert(aeb_demo::LoadCameraCalibration(WriteCalibrationFile(), &calibration));
  assert(calibration.image_width == 1920U);
  assert(calibration.image_height == 1536U);
  assert(std::fabs(calibration.fx - 1100.0) < 1e-6);
  assert(std::fabs(calibration.camera_height_m - 1.4) < 1e-6);
  assert(std::fabs(calibration.pitch_down_rad - (8.0 * M_PI / 180.0)) < 1e-6);
}

void LoadsSeparateIntrinsicAndExtrinsicFiles() {
  const std::string intrinsic_path = "/tmp/aeb_camera_intrinsic_test.yaml";
  {
    std::ofstream output(intrinsic_path);
    output << "image_width: 1920\n";
    output << "image_height: 1536\n";
    output << "fx: 1100.0\n";
    output << "fy: 1100.0\n";
    output << "cx: 960.0\n";
    output << "cy: 768.0\n";
  }

  const std::string extrinsic_path = "/tmp/aeb_camera_extrinsic_test.yaml";
  {
    std::ofstream output(extrinsic_path);
    output << "camera_height_m: 1.4\n";
    output << "pitch_down_deg: 8.0\n";
  }

  aeb_demo::CameraCalibration calibration;
  assert(aeb_demo::LoadCameraCalibration(intrinsic_path, extrinsic_path, &calibration));
  assert(calibration.image_width == 1920U);
  assert(std::fabs(calibration.pitch_down_rad - (8.0 * M_PI / 180.0)) < 1e-6);
}

void RejectsMissingRequiredFields() {
  const std::string path = "/tmp/aeb_bad_camera_calibration_test.yaml";
  std::ofstream output(path);
  output << "image_width: 1920\n";
  output << "fx: 1100.0\n";
  output.close();

  aeb_demo::CameraCalibration calibration;
  assert(!aeb_demo::LoadCameraCalibration(path, &calibration));
}

void ProjectsLowerImageRowsCloserOnGround() {
  aeb_demo::CameraCalibration calibration;
  assert(aeb_demo::LoadCameraCalibration(WriteCalibrationFile(), &calibration));

  double near_distance_m = 0.0;
  double far_distance_m = 0.0;

  assert(aeb_demo::ProjectPixelToGroundDistance(calibration, 960.0, 1300.0, &near_distance_m));
  assert(aeb_demo::ProjectPixelToGroundDistance(calibration, 960.0, 900.0, &far_distance_m));

  assert(near_distance_m > 0.0);
  assert(far_distance_m > near_distance_m);
}

}  // namespace

int main() {
  LoadsYamlLikeCalibrationFile();
  LoadsSeparateIntrinsicAndExtrinsicFiles();
  RejectsMissingRequiredFields();
  ProjectsLowerImageRowsCloserOnGround();
  return 0;
}
