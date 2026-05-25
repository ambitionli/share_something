#include "aeb_demo/transport/annex_b_parser.hpp"

#include <cstddef>

namespace aeb_demo {

namespace {

struct NalRange {
  std::size_t start_code_offset = 0U;
  std::size_t payload_offset = 0U;
  std::size_t next_start_code_offset = 0U;
};

bool HasStartCodeAt(const std::vector<std::uint8_t>& data, const std::size_t offset) {
  if (offset + 4U <= data.size() && data[offset] == 0x00U && data[offset + 1U] == 0x00U &&
      data[offset + 2U] == 0x00U && data[offset + 3U] == 0x01U) {
    return true;
  }

  if (offset + 3U <= data.size() && data[offset] == 0x00U && data[offset + 1U] == 0x00U &&
      data[offset + 2U] == 0x01U) {
    return true;
  }

  return false;
}

std::size_t StartCodeSizeAt(const std::vector<std::uint8_t>& data, const std::size_t offset) {
  if (offset + 4U <= data.size() && data[offset] == 0x00U && data[offset + 1U] == 0x00U &&
      data[offset + 2U] == 0x00U && data[offset + 3U] == 0x01U) {
    return 4U;
  }

  return 3U;
}

std::vector<NalRange> FindNalRanges(const std::vector<std::uint8_t>& data) {
  std::vector<NalRange> ranges;
  std::size_t offset = 0U;

  while (offset < data.size()) {
    if (!HasStartCodeAt(data, offset)) {
      ++offset;
      continue;
    }

    NalRange range;
    range.start_code_offset = offset;
    range.payload_offset = offset + StartCodeSizeAt(data, offset);

    std::size_t next = range.payload_offset;
    while (next < data.size() && !HasStartCodeAt(data, next)) {
      ++next;
    }

    range.next_start_code_offset = next;
    if (range.payload_offset < range.next_start_code_offset) {
      ranges.push_back(range);
    }
    offset = next;
  }

  return ranges;
}

}  // namespace

std::vector<H264Frame> AnnexBParser::ExtractAllIFrames(
    const std::vector<std::uint8_t>& stream,
    const std::uint64_t first_timestamp_ns) {
  const std::vector<NalRange> ranges = FindNalRanges(stream);
  std::vector<H264Frame> frames;

  std::size_t current_access_unit_start = 0U;
  bool has_access_unit = false;
  std::uint64_t frame_id = 0U;

  for (const NalRange& range : ranges) {
    const std::uint8_t nal_header = stream[range.payload_offset];
    if (!IsIdrNalUnit(nal_header)) {
      if (!has_access_unit) {
        current_access_unit_start = range.start_code_offset;
      }
      continue;
    }

    if (has_access_unit) {
      H264Frame frame;
      frame.frame_id = frame_id;
      frame.timestamp_ns = first_timestamp_ns + frame_id;
      frame.is_key_frame = true;
      frame.data.assign(
          stream.begin() + static_cast<std::ptrdiff_t>(current_access_unit_start),
          stream.begin() + static_cast<std::ptrdiff_t>(range.start_code_offset));
      frames.push_back(frame);
      ++frame_id;
    }

    current_access_unit_start = range.start_code_offset;
    has_access_unit = true;
  }

  if (has_access_unit) {
    H264Frame frame;
    frame.frame_id = frame_id;
    frame.timestamp_ns = first_timestamp_ns + frame_id;
    frame.is_key_frame = true;
    frame.data.assign(
        stream.begin() + static_cast<std::ptrdiff_t>(current_access_unit_start),
        stream.end());
    frames.push_back(frame);
  }

  return frames;
}

bool AnnexBParser::IsIdrNalUnit(const std::uint8_t nal_header) {
  constexpr std::uint8_t kNalTypeMask = 0x1FU;
  constexpr std::uint8_t kIdrNalType = 5U;
  return (nal_header & kNalTypeMask) == kIdrNalType;
}

}  // namespace aeb_demo
