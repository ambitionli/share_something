#include "aeb_demo/transport/annex_b_parser.hpp"

#include <cassert>
#include <cstdint>
#include <vector>

namespace {

void ExtractsEachAllIFrameAccessUnit() {
  const std::vector<std::uint8_t> stream = {
    0x00U, 0x00U, 0x00U, 0x01U, 0x67U, 0x01U,  // SPS
    0x00U, 0x00U, 0x00U, 0x01U, 0x68U, 0x02U,  // PPS
    0x00U, 0x00U, 0x00U, 0x01U, 0x65U, 0xAAU,  // IDR #1
    0x00U, 0x00U, 0x00U, 0x01U, 0x65U, 0xBBU   // IDR #2
  };

  const std::vector<aeb_demo::H264Frame> frames =
      aeb_demo::AnnexBParser::ExtractAllIFrames(stream, 1000U);

  assert(frames.size() == 2U);
  assert(frames[0].frame_id == 0U);
  assert(frames[0].timestamp_ns == 1000U);
  assert(frames[0].is_key_frame);
  assert(frames[0].data.size() == 18U);
  assert(frames[1].frame_id == 1U);
  assert(frames[1].timestamp_ns == 1001U);
  assert(frames[1].is_key_frame);
  assert(frames[1].data.size() == 6U);
}

void ReturnsEmptyForStreamWithoutIdr() {
  const std::vector<std::uint8_t> stream = {
    0x00U, 0x00U, 0x00U, 0x01U, 0x67U, 0x01U,
    0x00U, 0x00U, 0x00U, 0x01U, 0x68U, 0x02U
  };

  const std::vector<aeb_demo::H264Frame> frames =
      aeb_demo::AnnexBParser::ExtractAllIFrames(stream, 0U);

  assert(frames.empty());
}

}  // namespace

int main() {
  ExtractsEachAllIFrameAccessUnit();
  ReturnsEmptyForStreamWithoutIdr();
  return 0;
}
