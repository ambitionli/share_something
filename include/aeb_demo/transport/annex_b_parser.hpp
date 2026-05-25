#pragma once

#include "aeb_demo/common/frame_types.hpp"

#include <cstdint>
#include <vector>

namespace aeb_demo {

class AnnexBParser {
 public:
  static std::vector<H264Frame> ExtractAllIFrames(
      const std::vector<std::uint8_t>& stream,
      std::uint64_t first_timestamp_ns);

 private:
  static bool IsIdrNalUnit(std::uint8_t nal_header);
};

}  // namespace aeb_demo
